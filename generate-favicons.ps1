Add-Type -AssemblyName System.Drawing

$logoPath = Resolve-Path "public/assets/fb/logo.jpg"
$src = [System.Drawing.Image]::FromFile($logoPath)
$publicDir = Resolve-Path "public"

function Resize-And-Save($img, $width, $height, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($img, 0, 0, $width, $height)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $outPath"
}

Resize-And-Save $src 192 192 (Join-Path $publicDir "pwa-192x192.png")
Resize-And-Save $src 512 512 (Join-Path $publicDir "pwa-512x512.png")
Resize-And-Save $src 512 512 (Join-Path $publicDir "pwa-maskable-512x512.png")
Resize-And-Save $src 180 180 (Join-Path $publicDir "apple-touch-icon.png")
Resize-And-Save $src 64 64 (Join-Path $publicDir "favicon.png")
Resize-And-Save $src 32 32 (Join-Path $publicDir "favicon-32x32.png")
Resize-And-Save $src 16 16 (Join-Path $publicDir "favicon-16x16.png")

# Also save a 32x32 bitmap as favicon.ico
$bmp32 = New-Object System.Drawing.Bitmap(32, 32)
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.Clear([System.Drawing.Color]::White)
$g32.DrawImage($src, 0, 0, 32, 32)
$g32.Dispose()

$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Create((Join-Path $publicDir "favicon.ico"))
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp32.Dispose()

# Create base64 SVG for icon.svg
$bytes = [System.IO.File]::ReadAllBytes($logoPath)
$base64 = [Convert]::ToBase64String($bytes)
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <clipPath id="circleClip">
    <circle cx="100" cy="100" r="96" />
  </clipPath>
  <rect width="200" height="200" rx="40" fill="#ffffff" />
  <image href="data:image/jpeg;base64,$base64" width="200" height="200" clip-path="url(#circleClip)" />
</svg>
"@
[System.IO.File]::WriteAllText((Join-Path $publicDir "icon.svg"), $svgContent)
Write-Host "Updated public/icon.svg"

$src.Dispose()
Write-Host "All favicon and PWA icons successfully generated from Anando Pathshala tree logo!"
