# Install GitHub Actions artifacts to correct locations
# Run this after downloading the 4 artifact zip files

$downloadsPath = "$env:USERPROFILE\Downloads"

# Create directories
New-Item -ItemType Directory -Force -Path "src\vendor\@ant\computer-use-swift\prebuilds" | Out-Null
New-Item -ItemType Directory -Force -Path "src\vendor\modifiers-napi\build" | Out-Null

# Extract and copy computer-use-swift artifacts
Write-Host "Installing computer-use-swift artifacts..."
Expand-Archive -Path "$downloadsPath\computer-use-swift-addon.zip" -DestinationPath "temp-addon" -Force
Expand-Archive -Path "$downloadsPath\computer-use-swift-dylib.zip" -DestinationPath "temp-dylib" -Force
Copy-Item "temp-addon\computer_use.node" -Destination "src\vendor\@ant\computer-use-swift\prebuilds\" -Force
Copy-Item "temp-dylib\libcomputer_use.dylib" -Destination "src\vendor\@ant\computer-use-swift\prebuilds\" -Force
Remove-Item "temp-addon" -Recurse -Force
Remove-Item "temp-dylib" -Recurse -Force

# Extract and copy modifiers-napi artifacts
Write-Host "Installing modifiers-napi artifacts..."
Expand-Archive -Path "$downloadsPath\modifiers-napi-addon.zip" -DestinationPath "temp-addon" -Force
Expand-Archive -Path "$downloadsPath\modifiers-napi-dylib.zip" -DestinationPath "temp-dylib" -Force
Copy-Item "temp-addon\modifiers.node" -Destination "src\vendor\modifiers-napi\build\" -Force
Copy-Item "temp-dylib\libmodifiers.dylib" -Destination "src\vendor\modifiers-napi\build\" -Force
Remove-Item "temp-addon" -Recurse -Force
Remove-Item "temp-dylib" -Recurse -Force

Write-Host "Done! All artifacts installed."
