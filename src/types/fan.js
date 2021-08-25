import {Element} from 'chart.js';
import {scaleValue} from '../helpers';

export default class FanAnnotation extends Element {
  
    inRange(x, y) {
        return pointInFan({x,y},this);
    }
    
    draw(ctx) {
        const {x:centerX, y:centerY, drawEllipse,drawValues,options} = this;
        
        ctx.save();

        ctx.lineWidth = options.borderWidth;
        ctx.strokeStyle = options.borderColor;
        ctx.fillStyle = options.backgroundColor;
        ctx.beginPath();
        if (drawEllipse) {
            let minTheta = options.minTheta;
            let maxTheta = options.maxTheta;
            const {minRadiusX,maxRadiusX,minRadiusY,maxRadiusY} = drawValues;
            let startAngle =  -minTheta;
            let endAngle = -maxTheta;

            ctx.ellipse(centerX,centerY, minRadiusX, minRadiusY, 0, startAngle, endAngle,true);
            ctx.ellipse(centerX,centerY, maxRadiusX, maxRadiusY, 0, endAngle, startAngle,false);
            ctx.ellipse(centerX,centerY, minRadiusX, minRadiusY, 0, startAngle, startAngle,true);
            
        }
        else {
            const {x1,y1,x2,y2,x3,y3,x4,y4} = drawValues;
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x4, y4);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x1, y1);
        }

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
            
            minRx = scaleValue(xScale, options.centerX + options.minRadius, x);
            maxRx = scaleValue(xScale, options.centerX + options.maxRadius, x2);
            minRx = Math.abs(minRx - centerX);
            maxRx = Math.abs(maxRx - centerX);
        }
    
        if (yScale) {
            centerY = scaleValue(yScale, centerY, cy);
            minRy = scaleValue(yScale, options.centerY + options.minRadius, y);
            maxRy = scaleValue(yScale, options.centerY + options.maxRadius, y2);
            minRy = Math.abs( minRy - centerY);
            maxRy = Math.abs( maxRy - centerY);
        }
        let drawEllipse = true;
        let drawValues = {
            minRadiusX:minRx,
            maxRadiusX:maxRx,
            minRadiusY:minRy,
            maxRadiusY:maxRy,
        }
        if (centerX <= -32768 || centerY <= -32768 || centerX >= 32766 || centerY >= 32768) {
            drawEllipse = false;
            centerX = options.centerX;
            centerY = options.centerY;
            let minAngle = options.minTheta;
            let maxAngle = options.maxTheta;
            let fx1 = Math.cos(minAngle) * options.minRadius;
            let fy1 = Math.sin(minAngle) * options.minRadius;
            let fx2 = Math.cos(maxAngle) * options.minRadius;
            let fy2 = Math.sin(maxAngle) * options.minRadius;
            let fx3 = Math.cos(minAngle) * options.maxRadius;
            let fy3 = Math.sin(minAngle) * options.maxRadius;
            let fx4 = Math.cos(maxAngle) * options.maxRadius;
            let fy4 = Math.sin(maxAngle) * options.maxRadius;
            if (xScale) {
                fx1 = scaleValue(xScale, fx1 + centerX, x);
                fx2 = scaleValue(xScale, fx2 + centerX, x);
                fx3 = scaleValue(xScale, fx3 + centerX, x);
                fx4 = scaleValue(xScale, fx4 + centerX, x);
                
            }
        
            if (yScale) {
                fy1 = scaleValue(yScale, fy1 + centerY, y);
                fy2 = scaleValue(yScale, fy2 + centerY, y);
                fy3 = scaleValue(yScale, fy3 + centerY, y);
                fy4 = scaleValue(yScale, fy4 + centerY, y);
                
            }


            drawValues = {
                x1:fx1,
                y1:fy1,
                x2:fx2,
                y2:fy2,
                x3:fx3,
                y3:fy3,
                x4:fx4,
                y4:fy4,
            }
        }
        
        return {
            x:centerX, 
            y:centerY,
            drawEllipse:drawEllipse,
            drawValues:drawValues
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
  maxTheta: Math.PI * 2,
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
  