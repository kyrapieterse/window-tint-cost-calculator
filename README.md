# Window tinting cost calculator

An open-source calculator for estimating the installed cost of window film for homes and offices in South Africa. Enter the visible glass dimensions in millimetres, group identical panes, and set a rate in rand per square metre. The calculator shows the total glass area, film and fitting cost, extra charges and estimated total.

## Run it locally

Download or clone the repository and open `index.html` in a modern browser. Everything runs on your device, including when you are offline. The worksheet updates as you type and clears when you reload the page. There are no dependencies or build steps.

## Worked example

The starting values come from the [Tint & Screen window tinting price guide](https://tintandscreen.co.za/window-tinting-prices/).

| Input | Example |
| --- | ---: |
| Pane width × height | 1,000 × 1,500 mm |
| Identical panes | 4 |
| Total glass area | 6 m² |
| Example installed rate | R450/m² |
| Extra charges | R0 |
| **Estimated total** | **R2,700** |

R450/m² is an illustrative rate for film, preparation and fitting on accessible bare glass. Enter your own installed rate and add any separately priced work, such as travel or old film removal, once for the job. Use the same tax basis for all prices. Your installer can confirm the final scope and price.

## Calculation

```text
group area (m²) = width (mm) × height (mm) × quantity / 1,000,000
film and fitting = sum of group areas × installed rate
estimated total = film and fitting + extra charges
```

The calculator applies one installed rate to all pane groups. It rounds the combined film and fitting cost to the nearest cent before adding extras. A new, incomplete group pauses the estimate until its measurements are filled in or the group is removed.

## Reuse the calculation

`estimate.js` contains the calculation without the browser interface. In Node.js, import it with `require`. Width, height and quantity are positive whole numbers. Pass prices as integer cents, with a positive installed rate and optional non-negative extras. Invalid inputs raise a `RangeError`.

```js
const { calculateEstimate } = require("./estimate.js");

const estimate = calculateEstimate(
  [{ widthMm: 1000, heightMm: 1500, quantity: 4 }],
  45000, // R450.00 per m²
  0      // Once-off extra charges in cents
);

// estimate.areaM2 is 6 and estimate.totalCents is 270000 (R2,700).
```

## License

The calculator code is available under the [MIT License](LICENSE). The Tint & Screen name and logo identify the publisher and are outside the code license.
