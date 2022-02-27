import { DEFAULT_COLOR } from "../constant";

const MatrixMult = (m1 : Array<number>, m2 : Array<number>) : Array<number> => {
    const matrixResult : Array<number> = [];

    for(let i = 0; i < 3; ++i) {
        for(let j = 0; j < 3; ++j) {
            let temp = 0;
            for(let k = 0; k < 3; ++k) {
                temp += m1[i * 3 + k] * m2[k * 3 + j];
            }
            matrixResult.push(temp);
        }
    }
    
    return matrixResult;
};

const EuclidianDistance = (p1 : Array<number>, p2 : Array<number>) : number => {
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    return Math.hypot(x2 - x1, y2 - y1);
};

const IsPointInPolygon = (p : Array<number>, polygonVertex : Array<number>): boolean => {
    const pX = p[0];
    const pY = p[1];

    const newPolygonVertex = [];
    let j = 0;
    for(let i = 0; i < polygonVertex.length; i += 2) {
        newPolygonVertex.push({ x: polygonVertex[i], y: polygonVertex[i + 1] });
        j++;
    }

    let isInside = false;
    for(let i = 0, j = newPolygonVertex.length - 1; i < newPolygonVertex.length; j = i++) {
        const x1 = newPolygonVertex[i].x;
        const y1 = newPolygonVertex[i].y;

        const x2 = newPolygonVertex[j].x;
        const y2 = newPolygonVertex[j].y;

        // Check intersect or not.
        if((y1 > pY != y2 > pY) && (pX < ((x2 - x1) * (pY - y1)) / (y2 - y1) + x1)) isInside = true;
    }

    return isInside;
};

const IsPointInRectSquare = (p: Array<number>, rectVertex: Array<number>) : boolean => {
    const pX = p[0];
    const pY = p[1];

    const x1 = rectVertex[0];
    const y1 = rectVertex[1];
    
    const x2 = rectVertex[4];
    const y2 = rectVertex[5];

    if(x1 < x2) {
        if(y1 < y2) return pX > x1 && pX < x2 && pY > y1 && pY < y2;
        else return pX > x1 && pX < x2 && pY < y1 && pY > y2;
    } else {
        if(y1 < y2) return pX < x1 && pX > x2 && pY > y1 && pY < y2;
        else return pX < x1 && pX > x2 && pY < y1 && pY > y2;
    }
}

const HexToRGBA = (hexValue: string) : Array<number> => {
    const hexColorRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    const hex = hexValue.replace(hexColorRegex, function(_, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    const rs = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return rs 
        ? [parseInt(rs[1], 16) / 256, parseInt(rs[2], 16) / 256, parseInt(rs[3], 16) / 256, 1.0] 
        : DEFAULT_COLOR;
}

const CreateRandomString = (length : number) : string => {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for(let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

const DownloadFile = (data: string, filename: string, type: string) : void => {
    const file = new Blob([data], {type: type});

    const a = document.createElement("a")
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);

    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}


export { 
    MatrixMult, 
    EuclidianDistance, 
    IsPointInPolygon, 
    IsPointInRectSquare, 
    HexToRGBA, 
    DownloadFile, 
    CreateRandomString 
};