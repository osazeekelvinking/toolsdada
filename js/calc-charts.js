/**
 * ToolsBuddy - Zero-Dependency Micro-Charts Engine (calc-charts.js)
 * High-performance, theme-aware, retina-ready Canvas & SVG chart renderer:
 * - Donut / Breakdown Chart (P&I vs Taxes vs Insurance; Macros: Protein/Carbs/Fat)
 * - Area / Line Growth Chart (Amortization balance curves; Compound interest curves)
 * - Gauge / Spectrum Meter (BMI classification & healthy ranges)
 */

(function (window, document) {
  'use strict';

  const CalcCharts = {
    // Theme Colors Helper
    getTheme() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        isDark,
        textColor: isDark ? '#f8fafc' : '#0f172a',
        mutedColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#2e384d' : '#e2e8f0',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        bgSurface: isDark ? '#111827' : '#ffffff'
      };
    },

    /**
     * Prepares Canvas for crisp high-DPI (Retina) display
     */
    setupCanvas(canvas) {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width || canvas.width || 300;
      const height = rect.height || canvas.height || 220;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      return { ctx, width, height, dpr };
    },

    /**
     * Renders an interactive Donut / Pie Breakdown Chart
     * @param {HTMLCanvasElement|string} canvasEl
     * @param {Array<{label: string, value: number, color: string}>} slices
     * @param {Object} options { centerLabel, centerValue, formatValue }
     */
    drawDonut(canvasEl, slices, options = {}) {
      const canvas = typeof canvasEl === 'string' ? document.querySelector(canvasEl) : canvasEl;
      if (!canvas) return;

      const { ctx, width, height } = this.setupCanvas(canvas);
      const theme = this.getTheme();

      const total = slices.reduce((sum, s) => sum + (Math.max(0, s.value) || 0), 0);
      if (total <= 0) {
        ctx.fillStyle = theme.mutedColor;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const outerRadius = Math.min(centerX, centerY) - 10;
      const innerRadius = outerRadius * 0.65;

      let startAngle = -Math.PI / 2;

      slices.forEach(slice => {
        const val = Math.max(0, slice.value);
        if (val === 0) return;
        const sliceAngle = (val / total) * (Math.PI * 2);

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle, false);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = slice.color;
        ctx.fill();

        ctx.strokeStyle = theme.bgSurface;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        startAngle += sliceAngle;
      });

      // Draw Center Hole Content
      if (options.centerValue) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (options.centerLabel) {
          ctx.font = '500 11px sans-serif';
          ctx.fillStyle = theme.mutedColor;
          ctx.fillText(options.centerLabel, centerX, centerY - 10);
        }

        ctx.font = '700 17px sans-serif';
        ctx.fillStyle = theme.textColor;
        ctx.fillText(options.centerValue, centerX, centerY + (options.centerLabel ? 10 : 0));
      }
    },

    /**
     * Renders a Smooth Dual-Curve Area Growth / Balance Chart
     * Used for Amortization (Balance Drop vs Interest) or Investment Compounding
     * @param {HTMLCanvasElement|string} canvasEl
     * @param {Array<string|number>} xLabels - e.g. Year 1, Year 5...
     * @param {Array<{label: string, data: number[], color: string, fillColor?: string}>} series
     */
    drawAreaChart(canvasEl, xLabels, series, options = {}) {
      const canvas = typeof canvasEl === 'string' ? document.querySelector(canvasEl) : canvasEl;
      if (!canvas) return;

      const { ctx, width, height } = this.setupCanvas(canvas);
      const theme = this.getTheme();

      const padding = { top: 20, right: 20, bottom: 35, left: 55 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      if (chartWidth <= 0 || chartHeight <= 0) return;

      // Find max value across all series
      let maxVal = 0;
      series.forEach(s => {
        s.data.forEach(v => {
          if (v > maxVal) maxVal = v;
        });
      });
      maxVal = maxVal * 1.08 || 100; // 8% headroom

      // Draw Grid Lines (Y-Axis)
      const gridLines = 4;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '11px sans-serif';

      for (let i = 0; i <= gridLines; i++) {
        const yVal = (maxVal / gridLines) * i;
        const yPos = padding.top + chartHeight - (i / gridLines) * chartHeight;

        ctx.beginPath();
        ctx.strokeStyle = theme.gridColor;
        ctx.lineWidth = 1;
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(padding.left + chartWidth, yPos);
        ctx.stroke();

        ctx.fillStyle = theme.mutedColor;
        let formattedVal = yVal >= 1000000 
          ? (yVal / 1000000).toFixed(1) + 'M' 
          : yVal >= 1000 
            ? (yVal / 1000).toFixed(0) + 'k' 
            : yVal.toFixed(0);
        ctx.fillText(formattedVal, padding.left - 8, yPos);
      }

      const numPoints = xLabels.length;
      if (numPoints < 2) return;
      const stepX = chartWidth / (numPoints - 1);

      // Draw Series Curves
      series.forEach(s => {
        if (!s.data || s.data.length === 0) return;

        // Path for Area Fill
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);

        s.data.forEach((val, i) => {
          const x = padding.left + i * stepX;
          const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            // Cubic Bezier interpolation
            const prevX = padding.left + (i - 1) * stepX;
            const prevY = padding.top + chartHeight - (s.data[i - 1] / maxVal) * chartHeight;
            const cpX1 = prevX + (x - prevX) / 2;
            const cpY1 = prevY;
            const cpX2 = prevX + (x - prevX) / 2;
            const cpY2 = y;
            ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
          }
        });

        // Close to bottom for area gradient
        const lastX = padding.left + (s.data.length - 1) * stepX;
        ctx.lineTo(lastX, padding.top + chartHeight);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        grad.addColorStop(0, s.fillColor || s.color + '40'); // 25% opacity
        grad.addColorStop(1, s.fillColor || s.color + '05'); // 2% opacity
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke Line
        ctx.beginPath();
        s.data.forEach((val, i) => {
          const x = padding.left + i * stepX;
          const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = padding.left + (i - 1) * stepX;
            const prevY = padding.top + chartHeight - (s.data[i - 1] / maxVal) * chartHeight;
            const cpX1 = prevX + (x - prevX) / 2;
            const cpX2 = prevX + (x - prevX) / 2;
            ctx.bezierCurveTo(cpX1, prevY, cpX2, y, x, y);
          }
        });
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // Draw X-Axis Labels (Sampled to avoid crowding)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = theme.mutedColor;
      ctx.font = '11px sans-serif';

      const labelStep = Math.max(1, Math.floor(numPoints / 6));
      for (let i = 0; i < numPoints; i += labelStep) {
        const x = padding.left + i * stepX;
        ctx.fillText(String(xLabels[i]), x, padding.top + chartHeight + 8);
      }
      // Ensure last label is drawn
      if ((numPoints - 1) % labelStep !== 0) {
        const x = padding.left + (numPoints - 1) * stepX;
        ctx.fillText(String(xLabels[numPoints - 1]), x, padding.top + chartHeight + 8);
      }
    },

    /**
     * Renders a Gauge / Range Bar (e.g. BMI, Body Fat, Risk Score)
     * @param {HTMLElement|string} containerEl
     * @param {number} value
     * @param {Array<{label: string, min: number, max: number, color: string}>} ranges
     */
    renderRangeBar(containerEl, value, ranges) {
      const container = typeof containerEl === 'string' ? document.querySelector(containerEl) : containerEl;
      if (!container) return;

      const minVal = ranges[0].min;
      const maxVal = ranges[ranges.length - 1].max;
      const totalSpan = maxVal - minVal;

      // Clamp value
      const clampedVal = Math.max(minVal, Math.min(maxVal, value));
      const percentage = ((clampedVal - minVal) / totalSpan) * 100;

      let segmentsHtml = '';
      ranges.forEach(r => {
        const segWidth = ((r.max - r.min) / totalSpan) * 100;
        segmentsHtml += `<div class="tb-range-seg" style="width: ${segWidth}%; background-color: ${r.color};" title="${r.label} (${r.min}-${r.max})"></div>`;
      });

      container.innerHTML = `
        <div class="tb-range-track">
          ${segmentsHtml}
          <div class="tb-range-pin" style="left: ${percentage}%;">
            <div class="tb-range-pin-bubble">${value.toFixed(1)}</div>
            <div class="tb-range-pin-line"></div>
          </div>
        </div>
        <div class="tb-range-labels">
          ${ranges.map(r => `<span>${r.label}</span>`).join('')}
        </div>
      `;
    }
  };

  window.CalcCharts = CalcCharts;
})(window, document);
