const WHITE = 2;
const BLACK = 1;
const UNKNOWN = 0;
const BLACK_CELL_RATE = 0.56;
const DRAW_PER_FRAME = 50 // 1フレームで何セル分アニメーションさせるか
const numCols = 50;
const numRows = 30;
const cellSize = 16;
const fontSize = cellSize * 0.8;
// 2次元配列の初期化
const cells: HTMLDivElement[][] = Array.from({ length: numRows + 1 }, () =>
  new Array<HTMLDivElement>(numCols + 1));

/**
 * グリッドを初期化し、セルやヒントの表示・イベント設定を行う。
 */
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
      switch (Number(cell.textContent)) {
        case WHITE: cell.classList.add('White'); break;
        case BLACK: cell.classList.add('Black'); break;
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
      if (randomNumber < BLACK_CELL_RATE) {
        cell.textContent = String(BLACK);
      } else {
        cell.textContent = String(UNKNOWN);
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
 * @param event - イベントオブジェクト
 */
function toggleColor(event: MouseEvent) {
  const cell = event.target as HTMLDivElement;
  const values = [WHITE, BLACK, UNKNOWN];
  const idx = values.indexOf(Number(cell.textContent ?? ''));
  // 次の値（循環）
  cell.textContent = String(values[(idx + 1) % values.length]);
}

/**
 * 指定された列または行のヒント文字列を生成する関数
 * @param colOrRow - 'col' または 'row' の文字列
 * @param num - 列または行の番号
 * @returns 生成されたヒント文字列 例:'1,3,1'
 */
function getOneLineHintString(colOrRow: string, num: number): string {
  const cells = document.querySelectorAll(`[data-${colOrRow}="${num}"]`);
  let blackCounter = 0;
  const blackCounterArray: number[] = [];
  for (const cell of cells as NodeListOf<HTMLDivElement>) {
    const value = cell.textContent;
    if (value === String(BLACK)) {
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
  return blackCounterArray.length > 0 ? blackCounterArray.join(',') : String(UNKNOWN);
}

/**
 * ヒントを生成する
 */
function makeHints() {
  /**
   * ヒント配列を生成する関数
   * @param colOrRow - 'col' または 'row' の文字列
   * @param length - 行数 または 列数
   * @returns 生成されたヒント配列 例:['1,3,1','2,3']
   */
  function makeHintArray(colOrRow: string, length: number): string[] {
    const result: string[] = [];
    for (let i = 1; i <= length; i++) {
      const hint = getOneLineHintString(colOrRow, i);
      result.push(hint);
    }
    return result;
  }

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
 * @param row - 行番号
 * @param col - 列番号
 * @returns セルの値
 */
// function getCellValue(row: number, col: number): string {
//   const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLDivElement;
//   return cell.textContent || '0';
// }

// 初回のグリッド生成
generateRandomGrid();
makeHints();

/**
 * すべてのセルをクリアする。
 */
async function clearGrid() {
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols; col++) {
      const cell = cells[row][col];
      cell.textContent = String(UNKNOWN);
    }
  }
}

/**
 * パズルがすべて埋まっているか判定する。
 * 未入力セルが残っていれば false を返す。
 * @returns パズルが完成していればtrue、未完成ならfalse
 */
function isPuzzleComplete(): boolean {
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numCols; col++) {
      const cell = cells[row][col];
      if (!cell || cell.textContent === String(UNKNOWN)) return false;
    }
  }
  return true;
}

/**
 * 配列内のセル要素をランダムな順序にシャッフルする。
 * @param cellsArr シャッフル対象のセル配列
 * @returns なし
 */
function shuffleCells(cellsArr: HTMLDivElement[]) {
  for (let i = 0; i < cellsArr.length - 1; i++) {
    const j = i + Math.floor(Math.random() * (cellsArr.length - i));
    [cellsArr[i], cellsArr[j]] = [cellsArr[j], cellsArr[i]];
  }
}

const title = document.querySelector('#title');
if (title) {
  title.addEventListener('click', handleTitleClick);
}

const msg = document.querySelector('#msg') as HTMLSpanElement;

/**
 * 解析開始イベント
 */
async function handleTitleClick() {
  mainSolve();
}

/**
 * 0列目または0行目からヒントの配列を取得する
 * @param isRow - trueなら行ヒント、falseなら列ヒント
 * @returns 例：[[1,3,1],[2,3],[3]]
 */
function makeHintsList(isRow: boolean): number[][] {
  const result: number[][] = [];
  const limit = isRow ? numRows : numCols;
  for (let index = 1; index <= limit; index++) {
    const [row, col] = isRow ? [index, 0] : [0, index];
    const cell = cells[row][col].textContent || '';
    result.push(cell.split(',').map(Number));
  }
  return result;
}

async function mainSolve() {
  const rowHints = makeHintsList(true);
  const colHints = makeHintsList(false);

  // 横と縦のヒントの合計が同じかどうかをチェック
  const rowSum = rowHints.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0);
  const colSum = colHints.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0);
  if (rowSum !== colSum) {
    window.alert(`横のヒントの合計${rowSum} ≠ 縦のヒントの合計${colSum} です`);
    return;
  }
  console.log('ヒントの合計' + colSum);

  // gridの初期化
  let drawer = new AnimationDrawer(() => {
    msg.textContent = ``;
    clearGrid();
  });
  await drawer.draw();

  // solve用の2次元配列
  const cellBoard: number[][] = Array.from({ length: numRows }, () => Array(numCols).fill(UNKNOWN));

  // solve開始
  const startTime = Date.now();
  const result = await baseSolve(cellBoard, rowHints, colHints);
  if (result === -1) {
    window.alert('ヒントに誤りがあります');
    return;
  }

  let result2 = 0;
  if (result < numRows * numCols) {
    drawer = new AnimationDrawer(() => {
      msg.textContent = `２次元背理法開始`;
    });
    await drawer.draw();
    result2 = await solve2D(cellBoard, rowHints, colHints);
    if (result2 === -1) {
      window.alert('ヒントに誤りがあります');
      return;
    }
  }

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result + result2 === numRows * numCols) {
    msg.textContent += `　完成しました　経過時間: ${elapsedSec} 秒`;
  } else {
    msg.textContent += `　未完成　経過時間: ${elapsedSec} 秒`;
  }
}

/**
 * お絵かきロジックを背理法で解く
 * すべての行と列に対して背理法を適用して、確定できるマスが0になるまで繰り返す
 * @param cellBoard - お絵かきロジックの状態（白,黒,未）を格納した2次元配列
 * @param rowHints - すべての行のヒントを格納した配列	例：[[1,2],[1,2,1],[3]]
 * @param colHints - すべての列のヒントを格納した配列	例：[[1,2],[1,2,1],[3]]
 * @param isAnimation - アニメーションさせるかどうか
 * @returns 確定件数、エラー時は-1
 */
async function baseSolve(cellBoard: number[][], rowHints: number[][], colHints: number[][], isAnimation: boolean = true): Promise<number> {
  let result = 0;

  let drawer: AnimationDrawer | null = null;
  if (isAnimation) {
    drawer = new AnimationDrawer((x, y, color) => {
      cells[y + 1][x + 1].textContent = String(color);
    }, DRAW_PER_FRAME);
  }

  // 確定できるマスがある間は繰り返す
  let count = 99; // 確定したマスの数
  while (count > 0) {
    count = 0;

    // 各行についてfixLineCellsを実行
    for (let y = 0; y < numRows; y++) {
      // 行データを取得
      const lineCells: number[] = Array.from(colHints, (_, i) => cellBoard[y][i]);
      const [cnt, updatedLineCells]: [number, number[]] = fixLineCells(rowHints[y], lineCells);
      if (cnt === -1) return -1;
      if (cnt > 0) {
        for (let x = 0; x < numCols; x++) {
          cellBoard[y][x] = updatedLineCells[x];
          await drawer?.draw(x, y, updatedLineCells[x]);
        }
        count += cnt;
      }
    }

    // 各列についてfixLineCellsを実行
    for (let x = 0; x < numCols; x++) {
      // 列データを取得
      const lineCells: number[] = Array.from(rowHints, (_, i) => cellBoard[i][x]);
      const [cnt, updatedLineCells]: [number, number[]] = fixLineCells(colHints[x], lineCells);
      if (cnt === -1) return -1;
      if (cnt > 0) {
        for (let y = 0; y < numRows; y++) {
          cellBoard[y][x] = updatedLineCells[y];
          await drawer?.draw(x, y, updatedLineCells[y]);
        }
        count += cnt;
      }
    }

    result += count;
  }

  await drawer?.flush();
  return result;
}

/**
 * いずれかの1行または1列について、対応するヒントに基づき
 * ブロックを出来る限り左揃えにした配列を取得する
 * @param lineHints 行または列のヒントを格納した配列	例：[1,2,1]
 * @param lineCells 現在のブロック状態（白,黒,未）を格納した配列	例：[未,未,未,未,黒,未,白,未]
 * @returns 左揃えのブロック状態（白,黒,未）を格納した配列、エラー時はnull	例：[黒,白,白,黒,黒,白,白,黒]
 */
function leftAlignLineCells(lineHints: number[], lineCells: number[]): number[] | null {
  const blockCount = lineHints.length;
  const cellCount = lineCells.length;

  // 最も右端の黒マスの位置を保存（存在しない場合は-1を設定）
  const maxRightPos = lineCells.lastIndexOf(BLACK);

  // 各ブロックの右端と左端の位置を格納する配列を定義
  const rightPos: number[] = new Array(blockCount);
  const leftPos: number[] = new Array(blockCount);

  let k = 0;
  rightPos[k] = lineHints[k] - 1;

  outer: while (true) {
    // 最後(最も右端)のブロックの時
    if (k === blockCount - 1) {
      // もっと右に黒マスがあればその位置まで右側にシフト
      if (rightPos[k] < maxRightPos) {
        rightPos[k] = maxRightPos;
      }
    }

    // カレントブロックの左端を設定
    leftPos[k] = rightPos[k] - lineHints[k] + 1;

    // カレントブロック内を右端から左端に向かって1文字ずつ照合
    for (let i = rightPos[k]; i >= leftPos[k]; i--) {
      if (lineCells[i] === WHITE) {
        // 白マスの右にカレントブロック全体をシフト
        rightPos[k] = i + lineHints[k];
        if (rightPos[k] >= cellCount) return null;// ブロックの右端がはみ出た
        // カレントブロックをやり直し
        continue outer; // 外側のループを続ける
      }
    }

    // カレントブロックの左隣のマスから左側のブロックまで1文字ずつ照合
    const tmp = k > 0 ? rightPos[k - 1] + 1 : 0;
    for (let i = leftPos[k] - 1; i >= tmp; i--) {
      if (lineCells[i] === BLACK) {
        if (k === 0) return null; // 先頭(最も左端)ブロックのさらに左に黒マスあり
        // 左側のブロックの右端を黒マスの位置まで右側にシフト
        rightPos[k - 1] = i;
        // 1つ前(左)のブロックをやり直し
        k--;
        continue outer; // 外側のループを続ける
      }
    }

    // 次のブロックへ進む
    k++;
    if (k >= blockCount) break;

    rightPos[k] = rightPos[k - 1] + 1 + lineHints[k];
    if (rightPos[k] >= cellCount) return null;
  }

  // 結果の配列を作成（すべて白で初期化）
  const result: number[] = new Array(lineCells.length).fill(WHITE);
  for (let i = 0; i < blockCount; i++) {
    // leftPos[i]～rightPos[i]までの範囲を黒で埋める
    result.fill(BLACK, leftPos[i], rightPos[i] + 1);
  }
  return result;
}

/**
 * いずれかの1行または1列について、ヒントと現在のブロック状態に基づいて、
 * 確定可能なマスを全て確定する
 * 引数:
 * @param lineHints 行または列のヒントを格納した配列 	例：[2,2]
 * @param lineCells 現在のブロック状態（白,黒,未）を格納した配列  例：[未,未,白,未,未,未]
 * @returns Tuple
 * - number: 確定したマスの数、エラー時は-1
 * - number[]: 確定可能なマスを全て確定した後の配列  例：[黒,黒,白,未,黒,未]
 */
function fixLineCells(lineHints: number[], lineCells: number[]): [number, number[]] {
  // ブロックを左寄せする
  const leftAligned = leftAlignLineCells(lineHints, lineCells);
  if (leftAligned === null) return [-1, []];

  // ブロックを右寄せする
  // const tmp1 = [...lineHints].reverse();
  // const tmp2 = [...blockList].reverse();
  // const tmp3 = leftAlignBlocks(tmp1, tmp2) || [];
  // const rightAlignedBlock = tmp3.reverse();

  const result = Array.from(lineCells);
  const testLineCells = Array.from(lineCells);
  let count = 0;

  for (let i = 0; i < lineCells.length; i++) {
    if (testLineCells[i] === UNKNOWN) {
      testLineCells[i] = leftAligned[i] == BLACK ? WHITE : BLACK;
      if (leftAlignLineCells(lineHints, testLineCells) === null) {
        // 矛盾すれば仮定と反対の色で確定
        result[i] = leftAligned[i];
        count++;
      }
      // 元に戻す
      testLineCells[i] = UNKNOWN;
    }
  }
  return [count, result];
}

/**
 * 2次元背理法を用いてパズルを解く
 * massBoardのいずれかのマスを白と仮定し矛盾すれば黒で確定
 * 上記以外の時は黒と仮定し矛盾すれば白で確定
 * 確定できるマスが0になるまで繰り返す
 * @param cellBoard お絵かきロジックの状態（白,黒,未）を格納した2次元配列
 * @param rowHints すべての行のヒントを格納した配列	例：[[1,2],[1,2,1],[3]]
 * @param colHints すべての列のヒントを格納した配列	例：[[1,2],[1,2,1],[3]]
 * @returns 確定件数、エラー時は-1
 */
async function solve2D(cellBoard: number[][], rowHints: number[][], colHints: number[][]): Promise<number> {
  const drawer = new AnimationDrawer((x, y, color) => {
    cells[y + 1][x + 1].textContent = String(color);
  }, 1);

  // 背理法を実行
  async function tryCell(x: number, y: number): Promise<number> {
    for (const value of [BLACK, WHITE]) {
      const testCellBoard = cellBoard.map(row => row.slice());
      // 白または黒 と仮定
      testCellBoard[y][x] = value;
      if (value === BLACK) await drawer.draw(x, y, value);

      // 高速化のため対象の列か行に確定マスがある場合のみ仮定を実行
      if (fixLineCells(rowHints[y], testCellBoard[y])[0] > 0 ||
        fixLineCells(colHints[x], testCellBoard.map(row => row[x]))[0] > 0) {
        const cnt = await baseSolve(testCellBoard, rowHints, colHints, false);
        if (cnt === -1) {
          // 矛盾した場合、反対の色で確定
          cellBoard[y][x] = value === BLACK ? WHITE : BLACK;
          await drawer.draw(x, y, cellBoard[y][x]);
          const cnt = await baseSolve(cellBoard, rowHints, colHints);
          // 白でも黒でも矛盾したらエラー
          if (cnt === -1) return -1;
          // このマス＋確定できるだけ確定したマスの数
          return 1 + cnt;
        }
      }
      // 元のマスに戻すアニメーション
      await drawer.draw(x, y, cellBoard[y][x]);
    }
    return 0;
  }

  // 該当行の未確定マス数＋該当列の未確定マス数を返す(自身を除く)
  function countUnknown(x: number, y: number) {
    let cnt = 0;
    for (let yy = 0; yy < rowHints.length; yy++) {
      if (cellBoard[yy][x] === UNKNOWN && yy !== y) cnt++;
    }
    for (let xx = 0; xx < colHints.length; xx++) {
      if (cellBoard[y][xx] === UNKNOWN && xx !== x) cnt++;
    }
    return cnt;
  }

  // 前回の未確定マス数を保存する配列(初期値は0)
  let saveUnknownCnt = cellBoard.map(row => row.map(_ => 0));
  let result = 0;

  // 確定できるマスがある間は繰り返す
  let count = 99; // 確定したマスの数
  while (count > 0) {
    count = 0;
    for (let y = 0; y < rowHints.length; y++) {
      for (let x = 0; x < colHints.length; x++) {
        if (cellBoard[y][x] !== UNKNOWN) continue
        const unknownCnt = countUnknown(x, y);
        // 高速化のため前回から未確定マス数が変わっていない場合はスキップ
        if (saveUnknownCnt[y][x] === unknownCnt) continue;
        saveUnknownCnt[y][x] = unknownCnt;
        // 隣接するマスが確定マスか、境界にあるマスのみを対象とする
        if (y === 0 || y === rowHints.length - 1 ||
          x === 0 || x === colHints.length - 1 ||
          cellBoard[y - 1][x] !== UNKNOWN ||
          cellBoard[y + 1][x] !== UNKNOWN ||
          cellBoard[y][x - 1] !== UNKNOWN ||
          cellBoard[y][x + 1] !== UNKNOWN) {
          const cnt = await tryCell(x, y);
          if (cnt === -1) return -1;
          if (cnt > 0) {
            count += cnt;
          }
        }
      }
    }
    result += count;
  }
  return result;
}

//////////////////////////////////////////////////////////////////////////
/**
 * アニメーション付きで描画処理を行うためのクラス。
 * 描画関数と1フレームあたりの描画回数を指定し、描画命令をキューイングして順次実行する
 * アニメーションの有無や描画タイミングの制御が可能
 * @class AnimationDrawer
 * @example
 * const drawer = new AnimationDrawer(drawFunc, 2);
 * drawer.draw(x, y);
 * drawer.flush();
 */
//////////////////////////////////////////////////////////////////////////
class AnimationDrawer {
  // 1フレームあたりの描画回数（0の場合はアニメーションなし）
  #drawPerFrame: number;
  // 待機中の描画関数の引数用の配列
  #pendingArgs: any[][] = [];
  // 描画関数
  #drawFunc: (...args: any[]) => void;

  /**
   * コンストラクタ
   * @param {function} drawFunc 描画処理を行う関数
   * @param {number} drawPerFrame 1フレームあたりの描画回数
   *       （デフォルトは1、0の場合はアニメーションなし）
   */
  constructor(drawFunc: (...args: any[]) => void, drawPerFrame: number = 1) {
    this.#drawFunc = drawFunc;
    this.#drawPerFrame = drawPerFrame;
  }

  /**
   * 描画命令をキューに追加
   * @param {...any} args - 描画関数の引数
   */
  draw(...args: any[]): Promise<void> {
    this.#pendingArgs.push(args);
    if (this.#drawPerFrame > 0 && this.#pendingArgs.length >= this.#drawPerFrame) {
      return this.flush();
    }
    return Promise.resolve();
  }

  /**
   * キューにある描画命令を実行
   * @returns {Promise<void>}
   */
  flush(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        for (const arg of this.#pendingArgs) {
          this.#drawFunc(...arg);
        }
        this.#pendingArgs.length = 0;
        resolve();
      });
    });
  }
}
