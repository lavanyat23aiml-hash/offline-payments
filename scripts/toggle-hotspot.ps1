param (
    [string]$action # "on" or "off"
)

# Standard Windows Network commands
try {
    # Find the Wi-Fi adapter name automatically
    $wifiAdapter = Get-NetAdapter | Where-Object { $_.MediaType -eq 'Native 802.11' -or $_.Name -like "*Wi-Fi*" } | Select-Object -First 1

    if ($null -eq $wifiAdapter) {
        throw "No Wi-Fi adapter found on this PC."
    }

    $adapterName = $wifiAdapter.Name
    $currentState = $wifiAdapter.Status

    if ($action -eq "off") {
        Write-Host "Disabling Wi-Fi Adapter: $adapterName..."
        Disable-NetAdapter -Name $adapterName -Confirm:$false
        Write-Host "Offline."
    } elseif ($action -eq "on") {
        Write-Host "Enabling Wi-Fi Adapter: $adapterName..."
        Enable-NetAdapter -Name $adapterName -Confirm:$false
        Write-Host "Online."
    } else {
        Write-Host "Current Status: $currentState"
    }
} catch {
    Write-Error "Hardware Failure: $_"
    exit 1
}
