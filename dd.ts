let dPlayerX: number = 0;
let dPlayerY: number = 0;
let PlayerX: number = 1;
let PlayerY: number = 1;

let dGoblinX: number = 0;
let dGoblinY: number = 0;
let GoblinX: number = 5;
let GoblinY: number = 3 ;

const Space = ' '; // 0
const Wall = '#';  // 1
const Player = '@';
const Goblin = 'g'

const BoardFontSize = 100;
const LogFontSize = 50;
const LogHeightPad = 10;
const BoardCols = 24;
const BoardRows = 20;
const LogCols = 30;
const LogRows = 30;
const CanvasWidth = 2048;
const CanvasHeight = 1536;

let MessageQueue: Array<string> = [];
let Board: Array<number> = Array<number>(BoardRows*BoardCols);

function DDMain(): void
{
    MessageQueue.push("DUNGEON DIVER alpha-v0.0.1");
    RegisterInputHandlers();

    InitializeBoard(Board);
    Draw(); // Initial paint
}

/*
async DDMain(msSinceStart) {
    var elapsedMs = msSinceStart - this.mostRecentPaint;
    if (elapsedMs > 16.67) {
        if (!this.currentlyPainting) {
            await this.renderClockFace(elapsedMs);
            await this.renderClockHands(elapsedMs);
            this.mostRecentPaint = msSinceStart;
        }
    }
    window.requestAnimationFrame(this.continuous.bind(this));
}
async renderClockFace(elapsedMs) {
    return new Promise((resolve) => {
        if (this.isClockFaceDirty) {
            this.currentlyPainting = true;
            // lengthy drawing operations ...
            this.isClockFaceDirty = false;
            this.currentlyPainting = false;
        }
        resolve();
    });
}
async renderClockHands(elapsedMs) {
    return new Promise((resolve) => {
        if (this.isClockHandsDirty) {
            this.currentlyPainting = true;
            // lengthy drawing operations ...
            this.isClockHandsDirty = false;
            this.currentlyPainting = false;
        }
        resolve();
    });
}
*/

function InitializeBoard(Board: Array<number>): void
{
    for (let RowIndex: number = 0;
         RowIndex < BoardRows;
         ++RowIndex)
     {
        for (let ColIndex: number = 0;
             ColIndex < BoardCols;
             ++ColIndex)
         {
             if  ((RowIndex == 0) ||
                  (ColIndex == 0) ||
                  (RowIndex == BoardRows - 1) ||
                  (ColIndex == BoardCols - 1))
             {
                 Board[RowIndex*BoardCols+ColIndex] = 1; // Wall
             }
         }
     }
    Board[PlayerY*BoardCols+PlayerX] = 2; // Player
    Board[GoblinY*BoardCols+GoblinX] = 3; // Goblin
}

function Draw(): void
{
    const Canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (Canvas.getContext)
    {
        const Ctx = Canvas.getContext("2d");
        if (Ctx != null)
        {
            // Clear canvas
            Ctx.fillStyle = "rgb(0, 0, 0)";
            Ctx.fillRect(0, 0, CanvasWidth, CanvasHeight);

            // Font setup
            Ctx.font = BoardFontSize as unknown as string + 'px vt';
/***
* Draw board
*/
            const WallDim = Ctx.measureText(Wall);
            const PlayerDim = Ctx.measureText(Player);
            const GoblinDim = Ctx.measureText(Goblin);
            for (let RowIndex: number = 0;
                 RowIndex < BoardRows;
                 ++RowIndex)
             {
                for (let ColIndex: number = 0;
                     ColIndex < BoardCols;
                     ++ColIndex)
                {
                    const BoardValue = Board[RowIndex*BoardCols+ColIndex];
                    if (BoardValue == 1) // Wall
                    {
                        Ctx.fillStyle = "rgb(255, 255, 255)";
                        Ctx.fillText(Wall, ColIndex*WallDim.width, (RowIndex+1)*WallDim.actualBoundingBoxAscent);
                    }
                    else if (BoardValue == 2) // Player
                    {
                       Ctx.fillStyle = "rgb(0, 255, 0)";
                       Ctx.fillText(Player, PlayerDim.width*PlayerX, WallDim.actualBoundingBoxAscent*(PlayerY+1));
                       Ctx.beginPath();
                       Ctx.strokeStyle = "white";
                       Ctx.moveTo(0, 0);
                       Ctx.lineTo(PlayerDim.width*PlayerX, WallDim.actualBoundingBoxAscent*(PlayerY+1));
                       Ctx.stroke();
                    }
                    else if (BoardValue == 3) // Goblin
                    {
                       Ctx.fillStyle = "rgb(255, 0, 0)";
                       Ctx.fillText(Goblin, GoblinDim.width*GoblinX, WallDim.actualBoundingBoxAscent*(GoblinY+1));
                       Ctx.beginPath();
                       Ctx.strokeStyle = "white";
                       Ctx.moveTo(0, 0);
                       Ctx.lineTo(PlayerDim.width*GoblinX, WallDim.actualBoundingBoxAscent*(GoblinY+1));
                       Ctx.stroke();
                    }
                }
             }

            Ctx.beginPath();
            Ctx.strokeStyle = "red";
            Ctx.moveTo(PlayerDim.width*PlayerX, WallDim.actualBoundingBoxAscent*(PlayerY+1));
            Ctx.lineTo(PlayerDim.width*GoblinX, WallDim.actualBoundingBoxAscent*(GoblinY+1));
            Ctx.stroke();
/***
* Draw message box
*/
            while (MessageQueue.length > LogRows)
            {
                MessageQueue.shift();
            }

            Ctx.font = LogFontSize as unknown as string + 'px vt';
            for (let MessageIndex: number = 0;
                 MessageIndex < MessageQueue.length;
                 ++MessageIndex)
             {
                 const Message = MessageQueue[MessageIndex];
                 const MessageDim = Ctx.measureText(Message);
                 Ctx.fillText(Message, (BoardCols + 1)*WallDim.width, MessageDim.actualBoundingBoxAscent*(MessageIndex + 1) + LogHeightPad*(MessageIndex + 1));
             }
        }
    }
}

function UpdateEnemy(): void
{
    const dX = PlayerX - GoblinX;
    const dY = PlayerY - GoblinY;
    const Distance = Math.sqrt(dX*dX + dY*dY);
    MessageQueue.push(`${Distance}`);
}

function PlayerMoveHandler(Event: KeyboardEvent): void
{
    Event.preventDefault();

    dPlayerX = 0;
    dPlayerY = 0;
    Board[PlayerY*BoardCols+PlayerX] = 0;
    if (Event.key === 'a')
    {
        dPlayerX--;
    }
    else if (Event.key === 'd')
    {
        dPlayerX++;
    }
    else if (Event.key === 'w')
    {
        dPlayerY--;
    }
    else if (Event.key === 's')
    {
        dPlayerY++;
    }
    if (PlayerX + dPlayerX < (BoardCols - 1) && PlayerX + dPlayerX > 0)
    {
        PlayerX += dPlayerX;
    }
    if (PlayerY + dPlayerY < (BoardRows - 1) && PlayerY + dPlayerY > 0)
    {
        PlayerY += dPlayerY;
    }
    Board[PlayerY*BoardCols+PlayerX] = 2;
    MessageQueue.push(`PlayerX: ${PlayerX}, PlayerY: ${PlayerY}`);
    UpdateEnemy();
    Draw();
}

function RegisterInputHandlers(): void
{
    window.addEventListener("keyup", PlayerMoveHandler);
}

