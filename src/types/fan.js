import {Element} from 'chart.js';
import {scaleValue} from '../helpers';

export default class FanAnnotation extends Element {
  
    inRange(x, y) {
        return pointInFan({x,y},this);
    }
    
    draw(ctx) {
        const {x:centerX, y:centerY, minRadiusX,maxRadiusX,minRadiusY,maxRadiusY,options} = this;
        let minTheta = options.minTheta;
        let maxTheta = options.maxTheta;
        ctx.save();

        ctx.lineWidth = options.borderWidth;
        ctx.strokeStyle = options.borderColor;
        ctx.fillStyle = options.backgroundColor;
        ctx.beginPath();

        let startAngle =  - Math.PI / 180 * minTheta;
        let endAngle = - Math.PI / 180 * maxTheta;

        ctx.ellipse(centerX,centerY, minRadiusX, minRadiusY, 0, startAngle, endAngle,true);
        ctx.ellipse(centerX,centerY, maxRadiusX, maxRadiusY, 0, endAngle, startAngle,false);
        ctx.ellipse(centerX,centerY, minRadiusX, minRadiusY, 0, startAngle, startAngle,true);
        
        ctx.fill();

        // If no border, don't draw it
        if (options.borderWidth) {
            ctx.stroke();
        }
        ctx.restore();
    }

    resolveElementProperties(chart, options) {
        const xScale = chart.scales[options.xScaleID];
        const yScale = chart.scales[options.yScaleID];
        let centerX = options.centerX;
        let centerY = options.centerY;
        let minRx,maxRx,minRy,maxRy;
        let cx = chart.chartArea.width / 2;
        let cy = chart.chartArea.height / 2;
        let {top: y, left: x, bottom: y2, right: x2} = chart.chartArea;
        
        if (!xScale && !yScale) {
            return {options: {}};
        }
        minRx = options.minRadius;
        maxRx = options.maxRadius;
        minRy = minRx;
        maxRy = maxRx;
        if (xScale) {

            centerX = scaleValue(xScale, centerX, cx);
            
            minRx = scaleValue(xScale, options.centerX + options.minRadius, x2);
            maxRx = scaleValue(xScale, options.centerX + options.maxRadius, x2);
            minRx = Math.abs(minRx - centerX);
            maxRx = Math.abs(maxRx - centerX);
        }
    
        if (yScale) {
            centerY = scaleValue(yScale, centerY, cy);
            minRy = scaleValue(yScale, options.centerY + options.minRadius, y2);
            maxRy = scaleValue(yScale, options.centerY + options.maxRadius, y2);
            minRy = Math.abs( minRy - centerY);
            maxRy = Math.abs( maxRy - centerY);
        }

        
        return {
            x:centerX, 
            y:centerY,
            minRadiusX:minRx,
            maxRadiusX:maxRx,
            minRadiusY:minRy,
            maxRadiusY:maxRy,
        };
    }
}

FanAnnotation.id = 'fanAnnotation';

FanAnnotation.defaults = {
  display: true,
  adjustScaleRange: true,
  borderDash: [],
  borderDashOffset: 0,
  borderWidth: 1,
  cornerRadius: 0,
  xScaleID: 'x',
  centerX: 0,
  centerY: 0,
  yScaleID: 'y',
  minRadius: undefined,
  maxRadius: undefined,
  minTheta: 0,
  maxTheta: 360,
};

FanAnnotation.defaultRoutes = {
  borderColor: 'color',
  backgroundColor: 'color'
};
function pointInFan(p, fan) {
    const {x:centerX, y:centerY, minRadiusX,maxRadiusX,minRadiusY,maxRadiusY,options} = fan;
    if (maxRadiusY <= 0 || maxRadiusX <= 0) {
      return false;
    }
    
    let inside = (Math.pow(p.x - centerX, 2) / Math.pow(maxRadiusX, 2)) + (Math.pow(p.y - centerY, 2) / Math.pow(maxRadiusY, 2)) <= 1.0;
    if (!inside) {
        return false;
    }
    //should outside inner circle
    return (Math.pow(p.x - centerX, 2) / Math.pow(minRadiusX, 2)) + (Math.pow(p.y - centerY, 2) / Math.pow(minRadiusY, 2)) > 1.0;
}
  