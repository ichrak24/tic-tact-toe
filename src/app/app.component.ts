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
  turn: number = 0;

  @ViewChild('gridSvg') gridSvg: ElementRef | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  
  generateGrid(gridSizeInput: HTMLInputElement) {
    const size = parseInt(gridSizeInput.value);
    console.log('Taille de la grille :', size);
    if (size >= 3) {
      this.gridSize = size;
      this.grid = new Array(this.gridSize).fill(null).map(() => new Array(this.gridSize).fill(null));
      this.currentPlayer = 0;
  
      const cellWidth = 100 / this.gridSize;
      const cellHeight = 100 / this.gridSize;
      let svgString = '';
  
      // Generate rectangles for the grid
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          const x = j * cellWidth;
          const y = i * cellHeight;
          svgString += `<rect x="${x}%" y="${y}%" width="${cellWidth}%" height="${cellHeight}%" fill="green"></rect>`;
        }
      }
  
      const svgContent = `<svg id="grid" class="grid-svg" width="50%" height="50%" viewBox="0 0 100 100">${svgString}</svg>`;
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgContent);
      
      // Sélectionner les rectangles après avoir créé la grille SVG
      setTimeout(() => {
        if (this.gridSvg) {
          const svgElement = this.gridSvg.nativeElement;
          const rects = svgElement.querySelectorAll('rect');
          console.log('Rectangles sélectionnés:', rects);
  
          rects.forEach((rect: any, index: number) => {
            console.log('Ajout de l\'événement de clic à un rectangle');
            rect.addEventListener('click', () => {
              const row = Math.floor(index / this.gridSize);
              const col = index % this.gridSize;
              this.handleCellClick(row, col);
            });
          });
        }
      }, 0);
    } else {
      alert("La taille de la grille doit être au moins 3.");
    }
  }

  

 


  ngAfterViewInit() {
    setTimeout(() => {
      console.log('Rectangles:');
      if (this.gridSvg) {
        const svgElement = this.gridSvg.nativeElement;
        const rects = svgElement.querySelectorAll('rect');
        console.log('Rectangles sélectionnés:', rects);
  
        rects.forEach((rect: any, index: number) => {
          console.log('Ajout de l\'événement de clic à un rectangle');
          rect.addEventListener('click', () => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            this.handleCellClick(row, col);
          });
        });
      }
    }, 0);
  }
  



  
  handleCellClick(row: number, col: number) {
    console.log('Cellule cliquée : ', row, col);
    if (this.grid[row][col] === null) {
      this.grid[row][col] = this.symbols[this.currentPlayer]; // Assigner le symbole en fonction du joueur actuel
  
      // Mettre à jour le SVG en fournissant une fonction de rappel
      this.updateSVG(() => {
        // Attendre un court délai pour que le SVG soit mis à jour, puis afficher l'alerte
        setTimeout(() => {
          //alert(this.symbols[this.currentPlayer]); // Afficher le symbole du joueur actuel
        }, 100);
      });
  
      const winner = this.checkWinner();
      if (winner) {
        alert(`Le joueur ${this.currentPlayer + 1} a gagné !`); // Afficher le numéro du joueur actuel
      } else if (this.isDraw()) {
        alert("Match nul !");
      } else {
        this.currentPlayer = 1 - this.currentPlayer; // Alterner entre les joueurs (0 devient 1, 1 devient 0)
      }
    }
  }
  
  







updateSVG(callback: () => void) {
  let svgString = '';

  // Draw X or O based on the grid values
  for (let i = 0; i < this.gridSize; i++) {
    for (let j = 0; j < this.gridSize; j++) {
      const symbol = this.grid[i][j];
      if (symbol) {
        const cellWidth = 100 / this.gridSize;
        const cellHeight = 100 / this.gridSize;
        const xOffset = (j * cellWidth) + (cellWidth / 2); // Centre horizontal de la case
        const yOffset = (i * cellHeight) + (cellHeight / 2); // Centre vertical de la case

        if (symbol === 'X') {
          const lineLength = Math.min(cellWidth, cellHeight) * 0.8; // Longueur de la ligne pour X
          svgString += `<line x1="0" y1="0" x2="${100}%" y2="${100}%" stroke="black" stroke-width="5" stroke-linecap="round"/>`;
svgString += `<line x1="${100}%" y1="0" x2="0" y2="${100}%" stroke="black" stroke-width="5" stroke-linecap="round"/>`;
        } else {
          const radius = Math.min(cellWidth, cellHeight) * 0.4; // Rayon du cercle pour O
          svgString += `<circle cx="${xOffset}" cy="${yOffset}" r="${radius}" stroke="blue" fill="transparent" stroke-width="5"/>`;
        }
      }
    }
  }

  const svgContent = `<svg id="grid" width="100%" height="100%" viewBox="0 0 100 100">${svgString}</svg>`;
  this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgContent);
  console.log('Contenu SVG :', svgContent);
  callback(); // Appel de la fonction de rappel
}






  checkWinner(): string | null {
    // Check rows, columns, and diagonals for winning combinations
    for (let i = 0; i < this.gridSize; i++) {
      // Check rows
      if (this.grid[i][0] === this.grid[i][1] && this.grid[i][1] === this.grid[i][2] && this.grid[i][0] !== null) {
        return this.grid[i][0];
      }

      // Check columns
      if (this.grid[0][i] === this.grid[1][i] && this.grid[1][i] === this.grid[2][i] && this.grid[0][i] !== null) {
        return this.grid[0][i];
      }
    }

    // Check diagonals
    if (this.grid[0][0] === this.grid[1][1] && this.grid[1][1] === this.grid[2][2] && this.grid[0][0] !== null) {
      return this.grid[0][0];
    }
    if (this.grid[0][2] === this.grid[1][1] && this.grid[1][1] === this.grid[2][0] && this.grid[0][2] !== null) {
      return this.grid[0][2];
    }
    console.log('Grid:', this.grid);
    return null;
  }

  isDraw(): boolean {
    // Check if all cells are filled
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === null) {
          return false;
        }
      }
    }

    return true;
  }

  
}
