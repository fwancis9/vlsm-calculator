// VLSM Calculator JavaScript

function calculateVLSM() {
    const networkInput = document.getElementById('network').value.trim();
    const hostsInput = document.getElementById('hosts').value.trim();
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous results and errors
    resultsDiv.innerHTML = '';
    errorDiv.style.display = 'none';

    try {
        // Validate network address
        if (!isValidIPAddress(networkInput)) {
            throw new Error('Invalid network address format. Please use format like 15.0.0.0');
        }

        // Parse host requirements
        const hostRequirements = hostsInput.split(',')
            .map(h => parseInt(h.trim()))
            .filter(h => !isNaN(h) && h > 0);

        if (hostRequirements.length === 0) {
            throw new Error('Please enter valid host requirements (positive numbers)');
        }

        // Sort host requirements in descending order (VLSM best practice)
        hostRequirements.sort((a, b) => b - a);

        // Calculate subnets
        const subnets = calculateSubnets(networkInput, hostRequirements);
        
        // Display results
        displayResults(subnets);

    } catch (error) {
        showError(error.message);
    }
}

function isValidIPAddress(ip) {
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipRegex);
    
    if (!match) return false;
    
    for (let i = 1; i <= 4; i++) {
        const octet = parseInt(match[i]);
        if (octet < 0 || octet > 255) return false;
    }
    
    return true;
}

function calculateSubnets(networkAddress, hostRequirements) {
    const subnets = [];
    let currentNetwork = ipToNumber(networkAddress);
    
    for (let i = 0; i < hostRequirements.length; i++) {
        const hostsNeeded = hostRequirements[i];
        
        // Calculate required subnet size (hosts + network + broadcast)
        const totalAddresses = hostsNeeded + 2;
        
        // Find the smallest power of 2 that can accommodate the required addresses
        const subnetSize = Math.pow(2, Math.ceil(Math.log2(totalAddresses)));
        
        // Calculate subnet mask
        const hostBits = Math.log2(subnetSize);
        const subnetMask = 32 - hostBits;
        
        // Calculate network, broadcast, first and last usable IPs
        const networkAddr = currentNetwork;
        const broadcastAddr = networkAddr + subnetSize - 1;
        const firstUsable = networkAddr + 1;
        const lastUsable = broadcastAddr - 1;
        
        // Calculate OSPF values
        const wildcardMask = calculateWildcardMask(subnetMask);
        const ospfNetworkStatement = `${numberToIP(networkAddr)} ${wildcardMask}`;
        
        subnets.push({
            subnetNumber: i + 1,
            hostsRequired: hostsNeeded,
            subnetMask: `/${subnetMask}`,
            subnetMaskDecimal: numberToSubnetMask(subnetMask),
            networkAddress: numberToIP(networkAddr),
            broadcastAddress: numberToIP(broadcastAddr),
            firstUsable: numberToIP(firstUsable),
            lastUsable: numberToIP(lastUsable),
            totalHosts: subnetSize - 2,
            subnetSize: subnetSize,
            ospf: {
                wildcardMask: wildcardMask,
                networkStatement: ospfNetworkStatement,
                area: '0.0.0.0' // Default backbone area
            }
        });
        
        // Move to next available network address
        currentNetwork = broadcastAddr + 1;
    }
    
    return subnets;
}

function ipToNumber(ip) {
    const parts = ip.split('.').map(part => parseInt(part));
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function numberToIP(num) {
    return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
    ].join('.');
}

function numberToSubnetMask(prefixLength) {
    const mask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
    return numberToIP(mask);
}

function calculateWildcardMask(prefixLength) {
    // Wildcard mask is the inverse of subnet mask
    const subnetMask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
    const wildcardMask = (~subnetMask) >>> 0;
    return numberToIP(wildcardMask);
}

function displayResults(subnets) {
    const resultsDiv = document.getElementById('results');
    
    let html = '<h2>VLSM Calculation Results</h2>';
    html += '<div class="results-grid">';
    
    subnets.forEach(subnet => {
        html += `
            <div class="subnet-card">
                <h3>Subnet ${subnet.subnetNumber}</h3>
                <div class="subnet-info">
                    <div class="info-row">
                        <span class="label">Hosts Required:</span>
                        <span class="value">${subnet.hostsRequired}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Subnet Mask:</span>
                        <span class="value">${subnet.subnetMask} (${subnet.subnetMaskDecimal})</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Network Address:</span>
                        <span class="value highlight">${subnet.networkAddress}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">First Usable IP:</span>
                        <span class="value highlight">${subnet.firstUsable}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Last Usable IP:</span>
                        <span class="value highlight">${subnet.lastUsable}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Broadcast Address:</span>
                        <span class="value highlight">${subnet.broadcastAddress}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Total Available Hosts:</span>
                        <span class="value">${subnet.totalHosts}</span>
                    </div>
                    <div class="info-row ospf-section">
                        <span class="label">OSPF Wildcard Mask:</span>
                        <span class="value highlight">${subnet.ospf.wildcardMask}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">OSPF Network Statement:</span>
                        <span class="value highlight">${subnet.ospf.networkStatement}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">OSPF Area:</span>
                        <span class="value">${subnet.ospf.area}</span>
                    </div>
                    <div class="cli-config">
                        <div class="cli-code">
                            <code>router ospf 1<br>
network ${subnet.ospf.networkStatement} area ${subnet.ospf.area}</code>
                        </div>
                        <button class="copy-btn" onclick="copyToClipboard('${subnet.ospf.networkStatement} area ${subnet.ospf.area}')">
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function copyToClipboard(text) {
    const fullCommand = `router ospf 1\nnetwork ${text}`;
    navigator.clipboard.writeText(fullCommand).then(() => {
        // Show temporary feedback
        event.target.textContent = '✅ Copied!';
        setTimeout(() => {
            event.target.textContent = '📋 Copy';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullCommand;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        event.target.textContent = '✅ Copied!';
        setTimeout(() => {
            event.target.textContent = '📋 Copy';
        }, 2000);
    });
}

// URL parameter functions
function updateURL() {
    const network = document.getElementById('network').value.trim();
    const hosts = document.getElementById('hosts').value.trim();
    
    const params = new URLSearchParams();
    if (network) params.set('network', network);
    if (hosts) params.set('hosts', hosts);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const network = params.get('network');
    const hosts = params.get('hosts');
    
    if (network) {
        document.getElementById('network').value = network;
    }
    if (hosts) {
        document.getElementById('hosts').value = hosts;
        // Auto-calculate if both parameters are present
        if (network) {
            calculateVLSM();
        }
    }
}

// Allow Enter key to trigger calculation
document.addEventListener('DOMContentLoaded', function() {
    // Load values from URL on page load
    loadFromURL();
    
    const networkInput = document.getElementById('network');
    const hostsInput = document.getElementById('hosts');
    
    networkInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateVLSM();
    });
    
    hostsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateVLSM();
    });
    
    // Update URL when inputs change
    networkInput.addEventListener('input', updateURL);
    hostsInput.addEventListener('input', updateURL);
});
