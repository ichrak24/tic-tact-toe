
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  gridSize: number = 3; 
  symbols: string[] = ["X", "O"];
  currentPlayer: number = 0;
  grid: string[][] = [];
  svgContent: SafeHtml = '';
  gameResult: string | null = null;
  svgWidth: number = 500;
  svgHeight: number = 500;
  cellWidth: number = 100 / this.gridSize;
  cellHeight: number = 100 / this.gridSize;

  @ViewChild('gridSvg') gridSvg: ElementRef | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  generateGrid(gridSizeInput: HTMLInputElement) {
    const size = parseInt(gridSizeInput.value);
    if (size >= 3) {
      this.gridSize = size;
      this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
      this.currentPlayer = 0;
      this.updateSVG();
    } 
  }

  handleCellClick(row: number, col: number) {
    if (this.grid[row][col] === null && !this.gameResult) {
      this.grid[row][col] = this.symbols[this.currentPlayer];
      this.currentPlayer = 1 - this.currentPlayer;
      this.updateSVG();

      if (this.checkWinner()) {
        this.gameResult = `Le joueur ${this.symbols[1 - this.currentPlayer]} a gagné !`;
      } else if (this.isDraw()) {
        this.gameResult = "Match nul !";
      } else if (this.currentPlayer === 1) {
        const { row, col } = this.getRandomEmptyCell();
        if (row !== -1 && col !== -1) {
          this.grid[row][col] = this.symbols[this.currentPlayer];
          this.currentPlayer = 1 - this.currentPlayer;
          this.updateSVG();

          if (this.checkWinner()) {
            this.gameResult = `Le joueur ${this.symbols[1 - this.currentPlayer]} a gagné !`;
          } else if (this.isDraw()) {
            this.gameResult = "Match nul !";
          }
        }
      }
    }
  }

  getRandomEmptyCell(): { row: number, col: number } {
    const emptyCells: { row: number, col: number }[] = [];
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === null) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    if (emptyCells.length === 0) {
      return { row: -1, col: -1 };
    }
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  updateSVG() {
    let svgString = '';
    const fontSize = 100 / this.gridSize * 0.5; // Adjust font size based on grid size

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const cellWidth = 100 / this.gridSize;
        const cellHeight = 100 / this.gridSize;
        const xOffset = j * cellWidth + cellWidth / 2;
        const yOffset = i * cellHeight + cellHeight / 2;
        const symbol = this.grid[i][j];

        if (symbol) {
          svgString += `<text x="${xOffset}%" y="${yOffset}%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}%" fill="black">${symbol}</text>`;
        }
      }
    }

    const svgContent = `<svg id="grid" width="100%" height="100%" viewBox="0 0 100 100">${svgString}</svg>`;
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  checkWinner(): boolean {
    // Check rows, columns, and diagonals for winning combinations
    const checkLines = (lines: string[][]): boolean => {
      return lines.some(line => line.every(symbol => symbol === line[0] && symbol !== null));
    };

    const lines: string[][] = [...this.grid]; // rows
    for (let i = 0; i < this.gridSize; i++) {
      lines.push(this.grid.map(row => row[i])); // columns
    }
    lines.push([this.grid[0][0], this.grid[1][1], this.grid[2][2]]); // diagonal
    lines.push([this.grid[0][2], this.grid[1][1], this.grid[2][0]]); // anti-diagonal

    return checkLines(lines);
  }

  isDraw(): boolean {
    return this.grid.every(row => row.every(cell => cell !== null));
  }

  resetGame(gridSizeInput: HTMLInputElement) {
    this.gridSize = 3; // Réinitialiser la taille de la grille à sa valeur par défaut
    gridSizeInput.value = '3'; // Réinitialiser la valeur de l'input à sa valeur par défaut
    this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
    this.currentPlayer = 0;
    this.gameResult = null;
    this.updateSVG();
  }
  
}



