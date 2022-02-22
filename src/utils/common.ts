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
}

export { MatrixMult };