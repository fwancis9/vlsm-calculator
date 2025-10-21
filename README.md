# VLSM Calculator

A simple and intuitive web-based Variable Length Subnet Masking (VLSM) calculator that helps network administrators and students calculate subnet divisions efficiently.

## Features

- **Easy-to-use Interface**: Clean, modern web interface
- **VLSM Calculations**: Automatically calculates optimal subnet divisions
- **Comprehensive Results**: Shows network address, broadcast address, first and last usable IPs
- **Multiple Subnets**: Handle multiple host requirements in a single calculation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Input Validation**: Validates IP addresses and host requirements

## How to Use

1. **Enter Network Address**: Input your base network (e.g., `15.0.0.0`)
2. **Specify Host Requirements**: Enter the number of hosts needed for each subnet, separated by commas (e.g., `1500, 2000, 500`)
3. **Calculate**: Click the "Calculate VLSM" button to get results

## Example

**Input:**
- Network: `15.0.0.0`
- Host Requirements: `1500, 2000`

**Output:**
The calculator will provide:
- Subnet 1 (for 2000 hosts): Network, broadcast, first/last usable IPs
- Subnet 2 (for 1500 hosts): Network, broadcast, first/last usable IPs

Each result includes:
- Subnet mask (both CIDR and decimal notation)
- Network address
- First usable IP address
- Last usable IP address
- Broadcast address
- Total available hosts

## Getting Started

### Option 1: Direct Use
1. Clone this repository
2. Open `index.html` in your web browser
3. Start calculating!

### Option 2: Local Server
```bash
# Clone the repository
git clone https://github.com/yourusername/vlsm-calculator.git
cd vlsm-calculator

# Serve with Python (optional)
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

## Files Structure

```
VLSM/
├── index.html      # Main HTML file
├── style.css       # CSS styling
├── script.js       # JavaScript logic
└── README.md       # This file
```

## Technical Details

### VLSM Algorithm
The calculator uses the following approach:
1. Sorts host requirements in descending order (VLSM best practice)
2. Calculates the minimum subnet size for each requirement
3. Determines appropriate subnet masks
4. Assigns non-overlapping IP ranges
5. Provides comprehensive subnet information

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- No external dependencies required

## Contributing

Feel free to contribute to this project by:
1. Reporting bugs
2. Suggesting new features
3. Submitting pull requests

## License

This project is open source and available under the [MIT License](LICENSE).

## About VLSM

Variable Length Subnet Masking (VLSM) is a technique that allows network administrators to use different subnet mask lengths for different subnets within the same network. This enables more efficient use of IP address space by allocating exactly the number of addresses needed for each subnet.

---

**Made with ❤️ for network administrators and students learning subnetting.**
