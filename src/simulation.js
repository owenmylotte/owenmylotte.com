const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const massElement = document.getElementById('mass');
const plotCanvas = document.getElementById('plotCanvas');
const plotCtx = plotCanvas.getContext('2d');

const massInput = document.getElementById('mass');
const springConstantInput = document.getElementById('springConstant');
const dampingInput = document.getElementById('damping');
const startSimulationButton = document.getElementById('startSimulation');

let requestId;
let t = 0;
let dt = 0.02;

startSimulationButton.addEventListener('click', () => {
    if (requestId) {
        cancelAnimationFrame(requestId);
    }
    t = 0;
    animate();
//     Add buttons to apply specific forces in the middle of the simulation instead of restarting it.
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    plotCtx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
    ctx.strokeStyle = '#e3dce8';
    plotCtx.strokeStyle = '#e3dce8';

    const mass = parseFloat(massInput.value);
    const springConstant = parseFloat(springConstantInput.value);
    const damping = parseFloat(dampingInput.value);

    const displacement = calculateDisplacement(mass, springConstant, damping, t);

    drawSystem(displacement);
    drawPlot(displacement);

    t += dt;
    requestId = requestAnimationFrame(animate);
}

function calculateDisplacement(m, k, c, t) {
    const omega0 = Math.sqrt(k / m);
    const zeta = c / (2 * Math.sqrt(m * k));

    let displacement;

    if (zeta < 1) { // Underdamped
        const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
        displacement = Math.exp(-zeta * omega0 * t) * Math.sin(omegaD * t);
    } else if (zeta > 1) { // Overdamped
        const r1 = -zeta * omega0 + omega0 * Math.sqrt(zeta * zeta - 1);
        const r2 = -zeta * omega0 - omega0 * Math.sqrt(zeta * zeta - 1);
        displacement = (Math.exp(r1 * t) - Math.exp(r2 * t)) / (2 * Math.sqrt(zeta * zeta - 1));
    } else { // Critically damped
        displacement = (1 + t) * Math.exp(-omega0 * t);
    }

    // Scale the displacement so it's visible on the canvas
    displacement *= 100;

    return displacement;
}

function drawSystem(displacement) {
    const x = canvas.width / 2;
    const y = canvas.height / 2 + displacement;

    // Draw spring
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y - 20);
    ctx.stroke();

    // Update mass position
    // const canvasRect = canvas.getBoundingClientRect();
    // massElement.style.left = `${canvasRect.left + x - 20}px`;

    // Draw mass
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#f5e3ff";
    ctx.fill();
    ctx.stroke();
}

// Initialize an array to store plot data
const plotData = new Array(plotCanvas.width).fill(0);

function drawPlot(displacement) {
    // Shift plot data to the left
    plotData.shift();
    plotData.push(-displacement);

    // Draw the plot
    plotCtx.beginPath();
    plotCtx.moveTo(0, plotCanvas.height / 2 - plotData[0]);

    for (let i = 1; i < plotData.length; i++) {
        const yPos = plotCanvas.height / 2 - plotData[i];
        plotCtx.lineTo(i, yPos);
    }

    plotCtx.stroke();
}