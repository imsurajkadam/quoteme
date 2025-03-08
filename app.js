// Initialize variables
let items = [];
let companyLogo = null;

// Add this helper function at the top of the file
function formatIndianNumber(num) {
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Convert to Indian format (last 3 digits, then groups of 2)
    parts[0] = parts[0].replace(/,/g, '').replace(/\B(?=(\d{2})+(?!\d))/g, ',').replace(/^,/, '');
    return parts.join('.');
}

// Handle logo upload
document.getElementById('logo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            companyLogo = e.target.result;
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
});

// Handle input changes
['companyName', 'clientName', 'paymentTerms'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
});

// Add new item
function addItem() {
    const itemsContainer = document.querySelector('.items-list');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'grid grid-cols-12 gap-3 bg-white p-4 rounded-lg border border-gray-100';
    itemDiv.innerHTML = `
        <input type="text" placeholder="Description" class="input input-bordered col-span-5 bg-white" />
        <input type="number" placeholder="Qty" class="input input-bordered col-span-2 bg-white" />
        <input type="number" placeholder="Rate" class="input input-bordered col-span-2 bg-white" />
        <div class="col-span-2 flex items-center">
            <span class="font-medium text-gray-700">₹0</span>
        </div>
        <button class="btn btn-ghost btn-sm col-span-1 text-red-500 hover:bg-red-50" onclick="removeItem(this)">×</button>
    `;
    
    // Add event listeners to calculate total
    const inputs = itemDiv.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculateItemTotal(itemDiv);
            updatePreview();
        });
    });
    
    itemsContainer.appendChild(itemDiv);
    updatePreview();
}

// Remove item
function removeItem(button) {
    button.parentElement.remove();
    updatePreview();
}

// Calculate item total
function calculateItemTotal(itemDiv) {
    const inputs = itemDiv.querySelectorAll('input');
    const quantity = parseFloat(inputs[1].value) || 0;
    const rate = parseFloat(inputs[2].value) || 0;
    const total = Math.round(quantity * rate);
    itemDiv.querySelector('span').textContent = `₹${total}`;
}

// Update preview
function updatePreview() {
    const preview = document.getElementById('previewContent');
    const companyName = document.getElementById('companyName').value;
    const clientName = document.getElementById('clientName').value;
    const paymentTerms = document.getElementById('paymentTerms').value;
    const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let itemsHTML = '';
    let total = 0;
    
    document.querySelectorAll('.items-list > div').forEach(itemDiv => {
        const inputs = itemDiv.querySelectorAll('input');
        const description = inputs[0].value;
        const quantity = parseFloat(inputs[1].value) || 0;
        const rate = parseFloat(inputs[2].value) || 0;
        const itemTotal = Math.round(quantity * rate);
        total += itemTotal;
        
        itemsHTML += `
            <tr>
                <td class="py-4 px-4 text-gray-800">${description || 'Item Description'}</td>
                <td class="py-4 px-4 text-center text-gray-800">${quantity}</td>
                <td class="py-4 px-4 text-right text-gray-800">₹${rate}</td>
                <td class="py-4 px-4 text-right text-gray-800">₹${itemTotal}</td>
            </tr>
        `;
    });

    preview.innerHTML = `
        <div class="flex flex-col h-full">
            <!-- Header Section -->
            <div class="flex justify-between items-start mb-12">
                <div class="flex-1">
                    ${companyLogo ? `
                        <div class="mb-4 max-w-[200px]">
                            <img src="${companyLogo}" alt="Company Logo" class="h-16 object-contain"/>
                        </div>
                    ` : ''}
                    <h1 class="text-2xl font-bold text-gray-800 company-name">${companyName || 'Your Company Name'}</h1>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-indigo-600 quotation-header">QUOTATION</div>
                    <div class="text-gray-600 mt-1">${date}</div>
                </div>
            </div>

            <!-- Client Section -->
            <div class="bg-gray-50 rounded-lg p-6 mb-8 client-section">
                <div class="text-gray-600 text-sm font-medium">Prepared for:</div>
                <div class="text-xl font-semibold text-gray-800 mt-2">${clientName || 'Client Name'}</div>
            </div>
            
            <!-- Items Table -->
            <div class="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="py-3 px-4 text-left text-indigo-600 font-semibold">Description</th>
                            <th class="py-3 px-4 text-center text-indigo-600 font-semibold">Qty</th>
                            <th class="py-3 px-4 text-right text-indigo-600 font-semibold">Rate</th>
                            <th class="py-3 px-4 text-right text-indigo-600 font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${itemsHTML}
                    </tbody>
                    <tfoot>
                        <tr class="bg-gray-50">
                            <td colspan="3" class="py-4 px-4 text-right font-semibold text-gray-800">Total Amount:</td>
                            <td class="py-4 px-4 text-right font-bold text-indigo-600">₹${total}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <!-- Payment Terms -->
            <div class="mt-8 bg-gray-50 rounded-lg p-6 payment-terms">
                <h3 class="font-semibold text-gray-800 mb-3">Payment Terms</h3>
                <div class="text-gray-600 whitespace-pre-line">${paymentTerms || 'Please specify payment terms'}</div>
            </div>
        </div>
    `;
}

// Generate PDF
async function generatePDF() {
    // Show loading state
    const downloadBtn = document.querySelector('button[onclick="generatePDF()"]');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = `<span class="loading loading-spinner loading-sm"></span> Generating...`;
    downloadBtn.disabled = true;

    try {
        // Get the data
        const companyName = document.getElementById('companyName').value || 'Your Company Name';
        const clientName = document.getElementById('clientName').value || 'Client Name';
        const paymentTerms = document.getElementById('paymentTerms').value || 'Please specify payment terms';
        const date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Prepare items data
        let items = [];
        let total = 0;
        
        document.querySelectorAll('.items-list > div').forEach(itemDiv => {
            const inputs = itemDiv.querySelectorAll('input');
            const description = inputs[0].value || 'Item Description';
            const quantity = parseFloat(inputs[1].value) || 0;
            const rate = parseFloat(inputs[2].value) || 0;
            const itemTotal = Math.round(quantity * rate);
            total += itemTotal;
            
            items.push([
                description,
                { text: quantity.toString(), alignment: 'center' },
                { text: `₹${rate}`, alignment: 'right' },
                { text: `₹${itemTotal}`, alignment: 'right' }
            ]);
        });

        // Define the document definition
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 40, 40, 40],
            content: [
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                companyLogo ? {
                                    image: companyLogo,
                                    width: 150,
                                    margin: [0, 0, 0, 10]
                                } : {},
                                {
                                    text: companyName,
                                    fontSize: 20,
                                    bold: true,
                                    color: '#1f2937'
                                }
                            ]
                        },
                        {
                            width: 'auto',
                            stack: [
                                {
                                    text: 'QUOTATION',
                                    fontSize: 20,
                                    bold: true,
                                    color: '#4f46e5',
                                    alignment: 'right'
                                },
                                {
                                    text: date,
                                    fontSize: 12,
                                    color: '#4b5563',
                                    alignment: 'right',
                                    margin: [0, 5, 0, 0]
                                }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 30]
                },
                {
                    stack: [
                        {
                            text: 'Prepared for:',
                            fontSize: 12,
                            color: '#4b5563'
                        },
                        {
                            text: clientName,
                            fontSize: 16,
                            bold: true,
                            color: '#1f2937',
                            margin: [0, 5, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 30]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Description', style: 'tableHeader' },
                                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                                { text: 'Rate', style: 'tableHeader', alignment: 'right' },
                                { text: 'Amount', style: 'tableHeader', alignment: 'right' }
                            ],
                            ...items,
                            [
                                { text: 'Total Amount:', colSpan: 3, alignment: 'right', bold: true },
                                {}, {},
                                { text: `₹${total}`, alignment: 'right', bold: true, color: '#4f46e5' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
                        },
                        vLineWidth: function(i, node) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 0 || i === 1 || i === node.table.body.length ? '#e5e7eb' : '#f3f4f6';
                        },
                        paddingTop: function(i, node) { return 12; },
                        paddingBottom: function(i, node) { return 12; }
                    }
                },
                {
                    stack: [
                        {
                            text: 'Payment Terms',
                            fontSize: 14,
                            bold: true,
                            color: '#1f2937',
                            margin: [0, 30, 0, 10]
                        },
                        {
                            text: paymentTerms,
                            fontSize: 12,
                            color: '#4b5563'
                        }
                    ]
                }
            ],
            defaultStyle: {
                font: 'Roboto'
            },
            styles: {
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: '#4f46e5',
                    fillColor: '#f3f4f6'
                }
            }
        };

        // Generate and download the PDF
        pdfMake.createPdf(docDefinition).download(`${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-quotation.pdf`);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Sorry, there was an error generating the PDF. Please try again.');
    } finally {
        // Restore button state
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
} 