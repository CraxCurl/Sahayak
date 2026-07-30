Add-Type -AssemblyName System.Drawing

$src = "C:\SAHAYAK WORK\icons\Sahayak_AI_assistant_logo_design_202607301514.jpeg"
if (Test-Path $src) {
    $img = [System.Drawing.Image]::FromFile($src)
    $sizes = @(16, 48, 128)
    foreach ($size in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.DrawImage($img, 0, 0, $size, $size)
        $outPath = "C:\SAHAYAK WORK\icons\icon$size.png"
        if (Test-Path $outPath) { Remove-Item $outPath -Force }
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $bmp.Dispose()
        Write-Host "Generated icon$size.png successfully!"
    }
    $img.Dispose()
} else {
    Write-Host "Source image not found at $src"
}
