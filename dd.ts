let dPlayerX: number = 0;
let dPlayerY: number = 0;
let PlayerX: number = 1;
let PlayerY: number = 1;

let dGoblinX: number = 0;
let dGoblinY: number = 0;
let GoblinX: number = 10;
let GoblinY: number = 8 ;

const Space = '.'; // 0
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

const DEBUGLineToPlayer = false;
const DEBUGLineToGoblin = false;
const DEBUGLineFromPlayerToGoblin = false;

let MessageQueue: Array<string> = [];
let Board: Array<number> = Array<number>(BoardRows*BoardCols);

function DDMain(): void
{
    MessageQueue.push("DUNGEON DIVER alpha-v0.0.2");
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
            else
            {
                Board[RowIndex*BoardCols+ColIndex] = 0; // Space
            }
        }
    }
    Board[(PlayerY+3)*BoardCols+PlayerX+4] = 1;
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
            const SpaceDim = Ctx.measureText(Space);
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
                    if (BoardValue == 0) // Space
                    {
                        Ctx.fillStyle = "rgb(50, 50, 50)";
                        Ctx.fillText(Space, ColIndex*SpaceDim.width, (RowIndex+1)*WallDim.actualBoundingBoxAscent);
                    }
                    else if (BoardValue == 1) // Wall
                    {
                        Ctx.fillStyle = "rgb(255, 255, 255)";
                        Ctx.fillText(Wall, ColIndex*WallDim.width, (RowIndex+1)*WallDim.actualBoundingBoxAscent);
                    }
                    else if (BoardValue == 2) // Player
                    {
                       Ctx.fillStyle = "rgb(0, 255, 0)";
                       Ctx.fillText(Player, PlayerDim.width*PlayerX, WallDim.actualBoundingBoxAscent*(PlayerY+1));
                       if (DEBUGLineToPlayer)
                       {
                           Ctx.beginPath();
                           Ctx.strokeStyle = "white";
                           Ctx.moveTo(0, 0);
                           Ctx.lineTo(PlayerDim.width*PlayerX, WallDim.actualBoundingBoxAscent*(PlayerY+1));
                           Ctx.stroke();
                       }
                    }
                    else if (BoardValue == 3) // Goblin
                    {
                       Ctx.fillStyle = "rgb(255, 0, 0)";
                       Ctx.fillText(Goblin, GoblinDim.width*GoblinX, WallDim.actualBoundingBoxAscent*(GoblinY+1));
                       if (DEBUGLineToGoblin)
                       {
                           Ctx.beginPath();
                           Ctx.strokeStyle = "white";
                           Ctx.moveTo(0, 0);
                           Ctx.lineTo(PlayerDim.width*GoblinX, WallDim.actualBoundingBoxAscent*(GoblinY+1));
                           Ctx.stroke();
                       }
                    }
                }
             }

            if (DEBUGLineFromPlayerToGoblin)
            {
                Ctx.beginPath();
                Ctx.strokeStyle = "red";
                Ctx.moveTo(PlayerDim.width*PlayerX, WallDim.actualBoundingBoxAscent*(PlayerY+1));
                Ctx.lineTo(PlayerDim.width*GoblinX, WallDim.actualBoundingBoxAscent*(GoblinY+1));
                Ctx.stroke();
            }
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

interface sample_element
{
    X: number;
    Y: number;
    Count: number;
}

function UpdateEnemy(): void
{
    const dX = PlayerX - GoblinX;
    const dY = PlayerY - GoblinY;
    const Distance = Math.sqrt(dX*dX + dY*dY);
    MessageQueue.push(`${Distance}`);

    // Sample alogrithm
    const PathList: Array<sample_element> = [];
    PathList.push({X: PlayerX, Y: PlayerY, Count: 0});

    for (let PathListIndex: number = 0;
         PathListIndex < PathList.length;
         ++PathListIndex)
    {
        const CurrentSampleElement = PathList[PathListIndex];

        let nAdjTiles: number = 0;
        const AdjTiles = Array<sample_element>(4);
        if (CurrentSampleElement.X + 1 < BoardCols)
        {
            AdjTiles[nAdjTiles++] = {X: CurrentSampleElement.X + 1, Y: CurrentSampleElement.Y, Count: CurrentSampleElement.Count + 1};
        }
        if (CurrentSampleElement.X - 1 > -1)
        {
            AdjTiles[nAdjTiles++] = {X: CurrentSampleElement.X - 1, Y: CurrentSampleElement.Y, Count: CurrentSampleElement.Count + 1};
        }
        if (CurrentSampleElement.Y + 1 < BoardRows)
        {
            AdjTiles[nAdjTiles++] = {X: CurrentSampleElement.X, Y: CurrentSampleElement.Y + 1, Count: CurrentSampleElement.Count + 1};
        }
        if (CurrentSampleElement.Y - 1 > -1)
        {
            AdjTiles[nAdjTiles++] = {X: CurrentSampleElement.X, Y: CurrentSampleElement.Y - 1, Count: CurrentSampleElement.Count + 1};
        }
        for (let AdjTileIndex: number = 0;
             AdjTileIndex < nAdjTiles;
             ++AdjTileIndex)
         {
             const AdjTile = AdjTiles[AdjTileIndex];

             // Tile is "moveable"
             if (Board[AdjTile.Y*BoardCols + AdjTile.X] != 1) // not a Wall
             {
                // Don't add tiles that exist in PathList
                let ExistsInPathList: boolean = false;
                for (let PathListIndex: number =  0;
                     PathListIndex < PathList.length;
                     ++PathListIndex)
                 {
                     if ((PathList[PathListIndex].X == AdjTile.X) &&
                         (PathList[PathListIndex].Y == AdjTile.Y))
                     {
                         ExistsInPathList = true;
                         break;
                     }
                 }
                 // Push valid tile
                 if (!ExistsInPathList)
                 {
                     PathList.push(AdjTile);
                 }
             }
         }
    }

    // Map PathList onto board
    if (PathList.length > BoardRows*BoardCols)
    {
        throw("PANIC");
    }
    const MapdPathList = Array<number>(BoardRows*BoardCols); // Init?
    for (let MapdPathIndex: number = 0;
         MapdPathIndex < MapdPathList.length;
         ++MapdPathIndex)
    {
        MapdPathList[MapdPathIndex] = 10000;
    }

    for (let PathListIndex: number = 0;
         PathListIndex < PathList.length;
         ++PathListIndex)
    {
        const SampleElement = PathList[PathListIndex];
        MapdPathList[SampleElement.Y*BoardCols+SampleElement.X] = SampleElement.Count;
    }

    // From enemy pos decide where to move
    let TargetTile: sample_element = {X: -1, Y: -1, Count: -1};
    if (GoblinX + 1 < BoardCols)
    {
        if ((MapdPathList[GoblinY*BoardCols+GoblinX + 1] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX + 1, Y: GoblinY, Count:  MapdPathList[GoblinY*BoardCols+GoblinX + 1]};
        }
    }
    if (GoblinX - 1 > -1)
    {
        if ((MapdPathList[GoblinY*BoardCols+GoblinX - 1] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX - 1, Y: GoblinY, Count:  MapdPathList[GoblinY*BoardCols+GoblinX - 1]};
        }
    }
    if (GoblinY + 1 < BoardRows)
    {
        if ((MapdPathList[(GoblinY + 1)*BoardCols+GoblinX] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX, Y: GoblinY + 1, Count:  MapdPathList[(GoblinY + 1)*BoardCols+GoblinX]};
        }
    }
    if (GoblinY - 1 > -1)
    {
        if ((MapdPathList[(GoblinY - 1)*BoardCols+GoblinX] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX, Y: GoblinY - 1, Count: MapdPathList[(GoblinY - 1)*BoardCols+GoblinX]};
        }
    }

    if (TargetTile.Count != -1)
    {
        GoblinX = TargetTile.X;
        GoblinY = TargetTile.Y;
    }
}

function PlayerMoveHandler(Event: KeyboardEvent): void
{
    Event.preventDefault();

    dPlayerX = 0
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
    if (Board[PlayerY*BoardCols + PlayerX + dPlayerX] != 1)
    {
        PlayerX += dPlayerX;
    }
    if (Board[(PlayerY+dPlayerY)*BoardCols + PlayerX] != 1)
    {
        PlayerY += dPlayerY;
    }
    Board[PlayerY*BoardCols+PlayerX] = 2; // Player
    MessageQueue.push(`PlayerX: ${PlayerX}, PlayerY: ${PlayerY}`);
    UpdateEnemy();
    Draw();
}

function RegisterInputHandlers(): void
{
    window.addEventListener("keyup", PlayerMoveHandler);
}

