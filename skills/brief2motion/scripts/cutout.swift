// Usage: swift cutout.swift in.jpg out.png  -> subject kept, background painted paper white.
import Vision; import CoreImage; import AppKit
let a = CommandLine.arguments
guard a.count == 3, let ci = CIImage(contentsOf: URL(fileURLWithPath: a[1])) else { print("usage: cutout in out"); exit(2) }
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let r = req.results?.first else { print("no subject found"); exit(1) }
let mask = try r.generateScaledMaskForImage(forInstances: r.allInstances, from: h)
let m = CIImage(cvPixelBuffer: mask)
let white = CIImage(color: CIColor(red: 1, green: 1, blue: 1)).cropped(to: ci.extent)
let out = ci.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: white, kCIInputMaskImageKey: m])
let ctx = CIContext()
try ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
print("ok", a[2])
