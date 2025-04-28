const numCols = 30;
const numRows = 20;
const cellSize = 16;
const fontSize = cellSize * 0.8;
// 2次元配列の初期化
const cells: HTMLDivElement[][] = Array.from({ length: numRows + 1 }, () =>
  new Array<HTMLDivElement>(numCols + 1)
);

function generateRandomGrid() {
  document.documentElement.style.setProperty('--cellSize', `${cellSize}px`);
  document.documentElement.style.setProperty('--numCols', `${numCols}`);
  document.documentElement.style.setProperty('--numRows', `${numRows}`);
  document.documentElement.style.setProperty('--fontSize', `${fontSize}px`);

  const grid = document.querySelector('.grid') as HTMLDivElement;
  grid.innerHTML = '';

  // セル生成・配置
  for (let row = 0; row <= numRows; row++) {
    for (let col = 0; col <= numCols; col++) {
      const cell = document.createElement('div');
      cell.dataset.row = `${row}`;
      cell.dataset.col = `${col}`;
      grid.appendChild(cell);
      cells[row][col] = cell;
    }
  }

  // クリックイベント設定
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols; col++) {
      cells[row][col].addEventListener('click', toggleColor);
    }
  }

  // textContentチェンジイベント設定
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const cell = mutation.target as HTMLDivElement;
      cell.classList.remove('White', 'Black', 'Unknown');
      switch (cell.textContent) {
        case '2': cell.classList.add('White'); break;
        case '1': cell.classList.add('Black'); break;
        default: cell.classList.add('Unknown'); break;
      }
    }
  });

  // textContentチェンジイベントを各セルに紐づける
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols; col++) {
      const cell = cells[row][col];
      cell.addEventListener('click', toggleColor);
      observer.observe(cell, {
        characterData: false,
        childList: true,
        subtree: false
      });
    }
  }

  // 値（色・textContent）設定
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols; col++) {
      const cell = cells[row][col];
      const randomNumber = Math.random();
      if (randomNumber < 0.25) {
        cell.textContent = '2';
      } else if (randomNumber < 0.90) {
        cell.textContent = '1';
      } else {
        cell.textContent = '0';
      }
    }
  }

  // 縦ヒント設定
  for (let col = 1; col <= numCols; col++) {
    const cell = cells[0][col];
    cell.classList.add('v-hint');
    if ([6, 7, 8, 9, 0].includes(col % 10)) {
      cell.classList.add('Six-ten');
    }
  }
  // 横ヒント設定
  for (let row = 1; row <= numRows; row++) {
    const cell = cells[row][0];
    cell.classList.add('h-hint');
    if ([6, 7, 8, 9, 0].includes(row % 10)) {
      cell.classList.add('Six-ten');
    }
  }

  // 右端の線
  for (let row = 0; row <= numRows; row++) {
    const cell = cells[row][numCols];
    cell.classList.add('last-col');
  }
  // 下端の線
  for (let col = 0; col <= numCols; col++) {
    const cell = cells[numRows][col];
    cell.classList.add('last-row');
  }
}

/**
 * セルの色を切り替える関数
 * @param {Event} event - イベントオブジェクト
 */
function toggleColor(event: MouseEvent) {
  const cell = event.target as HTMLDivElement;
  const values = ['2', '1', '0'];
  const idx = values.indexOf(cell.textContent ?? '');
  // 次の値（循環）
  cell.textContent = values[(idx + 1) % values.length];
}

/**
 * 指定された列または行のヒント文字列を生成する関数
 * @param {string} colOrRow - 'col' または 'row' の文字列
 * @param {number} num - 列または行の番号
 * @returns {string} - 生成されたヒント文字列 例:'1,3,1'
 */
function getOneLineHintString(colOrRow: string, num: number): string {
  const cells = document.querySelectorAll(`[data-${colOrRow}="${num}"]`);
  let blackCounter = 0;
  const blackCounterArray: number[] = [];
  for (const cell of cells as NodeListOf<HTMLDivElement>) {
    const value = cell.textContent;
    if (value === '1') {
      blackCounter++;
    } else {
      if (blackCounter > 0) {
        blackCounterArray.push(blackCounter);
        blackCounter = 0;
      }
    }
  }
  if (blackCounter > 0) {
    blackCounterArray.push(blackCounter);
  }
  return blackCounterArray.length > 0 ? blackCounterArray.join(',') : "0";
}
/**
 * ヒント配列を生成する関数
 * @param {string} colOrRow - 'col' または 'row' の文字列
 * @param {number} length - 行数 または 列数
 * @returns {string[]} - 生成されたヒント配列 例:['1,3,1','2,3']
 */
function makeHintArray(colOrRow: string, length: number): string[] {
  const result: string[] = [];
  for (let i = 1; i <= length; i++) {
    const hint = getOneLineHintString(colOrRow, i);
    result.push(hint);
  }
  return result;
}

/**
 * ヒントを生成する
 */
function makeHints() {
  //縦のヒントを作成
  const colHints = makeHintArray('col', numCols);
  //横のヒントを作成
  const rowHints = makeHintArray('row', numRows);

  for (let i = 1; i <= numCols; i++) {
    const cell = cells[0][i];
    cell.innerText = colHints[i - 1];
  }
  for (let i = 1; i <= numRows; i++) {
    const cell = cells[i][0];
    cell.innerText = rowHints[i - 1];
  }

  console.log('[縦ヒント]' + '\n' + colHints.join('\n') + '\n');
  console.log('[横ヒント]' + '\n' + rowHints.join('\n') + '\n');

  const clipText = '\t' + colHints.join('\t') + '\n' + rowHints.join('\n') + '\n';
  navigator.clipboard.writeText(clipText)
}


/**
 * 行と列からセルの値を取得する
 * @param {number} row - 行番号
 * @param {number} col - 列番号
 * @returns {string} - セルの値
 */
// function getCellValue(row: number, col: number): string {
//   const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLDivElement;
//   return cell.textContent || '0';
// }

// 初回のグリッド生成
generateRandomGrid();
makeHints();

// いったんすべてクリア
// clearGrid();

// クリア
function clearGrid() {
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols; col++) {
      const cell = cells[row][col];
      cell.textContent = '0';
    }
  }
}

//アニメーション
(function setupRandomFillAnimation() {
  const title = document.querySelector('h1');
  if (!title) return;

  let startTime: number = 0;
  title.addEventListener('click', () => {
    clearGrid();
    startTime = Date.now();
    function isPuzzleComplete() {
      for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numCols; col++) {
          const cell = cells[row][col];
          if (!cell || cell.textContent === '0') return false;
        }
      }
      return true;
    }

    function randomizeCells(cellsArr: HTMLDivElement[]) {
      for (let i = cellsArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cellsArr[i], cellsArr[j]] = [cellsArr[j], cellsArr[i]];
      }
    }

    function processRows(next: () => void) {
      let row = 1;
      function processNextRow() {
        if (row > numRows) {
          next();
          return;
        }
        // 行内のunknownセルを取得
        const unknownCells: HTMLDivElement[] = [];
        for (let col = 1; col <= numCols; col++) {
          const cell = cells[row][col];
          if (!cell || cell.textContent !== '0') continue;
          unknownCells.push(cell);
        }
        if (unknownCells.length > 0) {
          randomizeCells(unknownCells);
          // ランダムな数だけ確定（1〜unknownCells.length）
          const fillCount = Math.floor(Math.random() * unknownCells.length) + 1;
          for (let i = 0; i < fillCount; i++) {
            const cell = unknownCells[i];
            const color = Math.random() < 0.5 ? '1' : '2';
            cell.textContent = color;
          }
        }
        row++;
        requestAnimationFrame(processNextRow);
      }
      processNextRow();
    }

    function processCols(next: () => void) {
      let col = 1;
      function processNextCol() {
        if (col > numCols) {
          next();
          return;
        }
        // 列内のunknownセルを取得
        const unknownCells: HTMLDivElement[] = [];
        for (let row = 1; row <= numRows; row++) {
          const cell = cells[row][col];
          if (!cell || cell.textContent !== '0') continue;
          unknownCells.push(cell);
        }
        if (unknownCells.length > 0) {
          randomizeCells(unknownCells);
          // ランダムな数だけ確定（1〜unknownCells.length）
          const fillCount = Math.floor(Math.random() * unknownCells.length) + 1;
          for (let i = 0; i < fillCount; i++) {
            const cell = unknownCells[i];
            const color = Math.random() < 0.5 ? '1' : '2';
            cell.textContent = color;
          }
        }
        col++;
        requestAnimationFrame(processNextCol);
      }
      processNextCol();
    }

    function animateLoop() {
      if (isPuzzleComplete()) {
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        alert(`完成しました！\n経過時間: ${elapsedSec} 秒`);
        return;
      }
      processRows(() => {
        processCols(() => {
          requestAnimationFrame(animateLoop);
        });
      });
    }
    animateLoop();
  });
})();
