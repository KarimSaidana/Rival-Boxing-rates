let ranges = [];
let discountRates = [];

document.getElementById("discount-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get input values
    const startDiscount = parseFloat(document.getElementById("start-discount").value) / 100;
    const maxDiscount = parseFloat(document.getElementById("max-discount").value) / 100;
    const numBrackets = parseInt(document.getElementById("num-brackets").value);
    const growthRate = parseFloat(document.getElementById("growth-rate").value);
    const firstRange = parseFloat(document.getElementById("first-range").value);
    const secondRange = parseFloat(document.getElementById("second-range").value);

    // Initialize ranges and discount rates
    ranges = [0, firstRange, secondRange];
    discountRates = [0, (startDiscount * 100).toFixed(2)]; // First discount is 0%, second is starting discount

    // Calculate discount rates and ranges starting from the third bracket
    for (let i = 3; i <= numBrackets; i++) {
        const discount = startDiscount + (maxDiscount - startDiscount) * (1 - Math.exp(-growthRate * (i - 2)));
        discountRates.push((discount * 100).toFixed(2));

        const growthFactor = discount / (startDiscount + (maxDiscount - startDiscount) * (1 - Math.exp(-growthRate * (i - 3))));
        const nextRange = ranges[ranges.length - 1] + (ranges[2] - ranges[1]) * growthFactor;
        ranges.push(nextRange);
    }

    // Display the Overall Brackets Table
    const tbody = document.querySelector("#results-table tbody");
    tbody.innerHTML = ""; // Clear previous results
    for (let i = 1; i < ranges.length; i++) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i}</td>
            <td>$${Math.round(ranges[i - 1]).toLocaleString()} – $${Math.round(ranges[i]).toLocaleString()}</td>
            <td>${discountRates[i - 1]}%</td>
        `;
        tbody.appendChild(row);
    }
});

document.getElementById("amount-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Check if brackets have been calculated
    if (ranges.length === 0 || discountRates.length === 0) {
        alert("Please calculate the brackets first!");
        return;
    }

    const amount = parseFloat(document.getElementById("amount").value);
    let totalDiscount = 0;

    const tbody = document.querySelector("#discount-summary-table tbody");
    tbody.innerHTML = ""; // Clear previous results

    for (let i = 1; i < ranges.length; i++) {
        const lowerLimit = ranges[i - 1];
        const upperLimit = ranges[i];
        const rate = i === 1 ? 0 : parseFloat(discountRates[i - 1]) / 100;

        // Calculate applicable amount for this bracket
        const applicableAmount = Math.max(0, Math.min(amount, upperLimit) - lowerLimit);
        const discountForBracket = applicableAmount * rate;
        totalDiscount += discountForBracket;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i}</td>
            <td>$${Math.round(applicableAmount).toLocaleString()}</td>
            <td>${discountRates[i - 1]}%</td>
            <td>$${discountForBracket.toFixed(2)}</td>
        `;
        tbody.appendChild(row);

        // Stop processing if the amount falls within this bracket
        if (amount <= upperLimit) break;
    }

    const effectiveDiscount = (totalDiscount / amount) * 100;
    document.getElementById("total-discount").innerText = `Total Discount: $${totalDiscount.toFixed(2)}`;
    document.getElementById("effective-discount").innerText = `Effective Discount Percentage: ${effectiveDiscount.toFixed(2)}%`;
});
