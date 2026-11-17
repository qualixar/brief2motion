// Usage: swift cutout.swift in.jpg out.png  -> subject kept, background painted paper white.
// Needs macOS 14 or newer and the Xcode command line tools (xcode-select --install). On-device only: nothing is uploaded.
import Vision; import CoreImage; import AppKit

func fail(_ message: String, _ code: Int32) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(code)
}

let a = CommandLine.arguments
guard a.count == 3 else { fail("usage: swift cutout.swift in.jpg out.png", 2) }
guard #available(macOS 14, *) else { fail("cutout.swift needs macOS 14 or newer. Ask for a photo on a plain background instead.", 1) }

// applyOrientationProperty: a phone photo stores its rotation in EXIF; without this the PNG comes out sideways.
guard let ci = CIImage(contentsOf: URL(fileURLWithPath: a[1]), options: [.applyOrientationProperty: true]) else {
    fail("cutout: could not read an image at \(a[1])", 2)
}
do {
    let req = VNGenerateForegroundInstanceMaskRequest()
    let h = VNImageRequestHandler(ciImage: ci)
    try h.perform([req])
    guard let r = req.results?.first else { fail("cutout: no subject found in \(a[1])", 1) }
    let mask = try r.generateScaledMaskForImage(forInstances: r.allInstances, from: h)
    let m = CIImage(cvPixelBuffer: mask)
    let white = CIImage(color: CIColor(red: 1, green: 1, blue: 1)).cropped(to: ci.extent)
    let out = ci.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: white, kCIInputMaskImageKey: m])
    let ctx = CIContext()
    try ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
    print("ok", a[2])
} catch {
    fail("cutout failed: \(error.localizedDescription)", 1)
}
