let dPlayerX: number = 0;
let dPlayerY: number = 0;
let PlayerX: number = 1;
let PlayerY: number = 1;
let PlayerHP: number = 100;
let PlayerSeeDist: number = 4;

let dGoblinX: number = 0;
let dGoblinY: number = 0;
let GoblinX: number = 10;
let GoblinY: number = 8 ;
const GoblinAggroDist: number = 4;

const Space = '.'; // 0
const Wall = '#';  // 1
const Player = '@';
const Goblin = 'g'

enum TileType
{
    Space = 0,
    Wall = 1,
    Player = 2,
    Goblin = 3
}

const BoardFontSize = 92;
const LogFontSize = 35;
const LogHeightPad = 10;
const BoardCols = 30;
const BoardRows = 25;
const LogCols = 30;
const LogRows = 30;
const CanvasWidth = 2048;
const CanvasHeight = 1536;

const DEBUGLineToPlayer = false;
const DEBUGLineToGoblin = false;
const DEBUGLineFromPlayerToGoblin = false;

interface tile
{
    Value: number;
    Splord: boolean;
    Walkable: boolean;
}

interface sample_element
{
    X: number;
    Y: number;
    Count: number;
}

let MessageQueue: Array<string> = [];
let Board: Array<tile> = Array<tile>(BoardRows*BoardCols);

function DDMain(): void
{
    MessageQueue.push("DUNGEON DIVER alpha-v0.0.2");
    RegisterInputHandlers();

    InitializeBoard(Board);
    const MapdPathListToPlayer = DistanceMapFromTarget(PlayerX, PlayerY);
    Draw(MapdPathListToPlayer); // Initial paint
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

function InitializeBoard(Board: Array<tile>): void
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
                 (ColIndex == BoardCols - 1)) // Walls
            {
                Board[RowIndex*BoardCols+ColIndex] = {Value: TileType.Wall, Splord: false, Walkable: false};
            }
            else // Air
            {
                Board[RowIndex*BoardCols+ColIndex] = {Value: TileType.Space, Splord: false, Walkable: true};
            }
        }
    }
    Board[PlayerY*BoardCols+PlayerX] = {Value: TileType.Player, Splord: true, Walkable: false}; // TODO(cjb): Diffrent way to keep track of player
    Board[GoblinY*BoardCols+GoblinX] = {Value: TileType.Goblin, Splord: false, Walkable: false};
}

function Draw(MapdPathListToPlayer: Array<number> ): void
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
                    // Check player can see this far...
                    if (MapdPathListToPlayer[RowIndex*BoardCols+ColIndex] > PlayerSeeDist)
                    {
                        continue;
                    }
                    const TileId = Board[RowIndex*BoardCols+ColIndex].Value;
                    if (TileId == TileType.Space)
                    {
                        Ctx.fillStyle = "rgb(50, 50, 50)";
                        Ctx.fillText(Space, ColIndex*SpaceDim.width, (RowIndex+1)*WallDim.actualBoundingBoxAscent);
                    }
                    else if (TileId == TileType.Wall)
                    {
                        Ctx.fillStyle = "rgb(255, 255, 255)";
                        Ctx.fillText(Wall, ColIndex*WallDim.width, (RowIndex+1)*WallDim.actualBoundingBoxAscent);
                    }
                    else if (TileId == TileType.Player)
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
                    else if (TileId == TileType.Goblin)
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
            const HeightDim = Ctx.measureText('a').actualBoundingBoxAscent;
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
                Ctx.fillText(Message, (BoardCols + 1)*WallDim.width, HeightDim*(MessageIndex + 1));// + LogHeightPad*(MessageIndex + 1));
            }
/***
* Draw info box
*/
            const PlayerPosStr = `Pos: (${PlayerX}, ${PlayerY})`;
            Ctx.fillText(PlayerPosStr, (BoardCols + 1)*WallDim.width, HeightDim*LogRows);// + (LogRows*LogHeightPad));

            const PlayerHPStr = `HP: ${PlayerHP}`;
            Ctx.fillText(PlayerHPStr, (BoardCols + 1)*WallDim.width, HeightDim*(LogRows + 1));// + ((LogRows + 1)*LogHeightPad));
        }
    }
}

function DistanceMapFromTarget(TargetX: number, TargetY: number): Array<number>
{
    // Sample walk alogrithm
    const PathList: Array<sample_element> = [];
    PathList.push({X: TargetX, Y: TargetY, Count: 0});
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

    // Map PathList onto board
    if (PathList.length > BoardRows*BoardCols)
    {
        throw("PANIC");
    }
    const MapdPathList = Array<number>(BoardRows*BoardCols);
    for (let MapdPathIndex: number = 0;
         MapdPathIndex < MapdPathList.length;
         ++MapdPathIndex)
    {
        MapdPathList[MapdPathIndex] = 10000; // What should initialization be here?
    }
    for (let PathListIndex: number = 0;
         PathListIndex < PathList.length;
         ++PathListIndex)
    {
        const SampleElement = PathList[PathListIndex];
        MapdPathList[SampleElement.Y*BoardCols+SampleElement.X] = SampleElement.Count;
    }

    return MapdPathList;
}

function UpdateEnemy(MapdPathListToPlayer: Array<number> ): void
{
    // From enemy pos decide where to move
    let TargetTile: sample_element = {X: GoblinX, Y: GoblinY, Count: MapdPathListToPlayer[GoblinY*BoardCols+GoblinX]};
    if (GoblinX + 1 < BoardCols)
    {
        if ((Board[GoblinY*BoardCols+GoblinX + 1].Walkable) &&
            (MapdPathListToPlayer[GoblinY*BoardCols+GoblinX + 1] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX + 1, Y: GoblinY, Count:  MapdPathListToPlayer[GoblinY*BoardCols+GoblinX + 1]};
        }
    }
    if (GoblinX - 1 > -1)
    {
        if ((Board[GoblinY*BoardCols+GoblinX - 1].Walkable) &&
            (MapdPathListToPlayer[GoblinY*BoardCols+GoblinX - 1] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX - 1, Y: GoblinY, Count:  MapdPathListToPlayer[GoblinY*BoardCols+GoblinX - 1]};
        }
    }
    if (GoblinY + 1 < BoardRows)
    {
        if ((Board[(GoblinY + 1)*BoardCols+GoblinX].Walkable) &&
            (MapdPathListToPlayer[(GoblinY + 1)*BoardCols+GoblinX] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX, Y: GoblinY + 1, Count:  MapdPathListToPlayer[(GoblinY + 1)*BoardCols+GoblinX]};
        }
    }
    if (GoblinY - 1 > -1)
    {
        if ((Board[(GoblinY - 1)*BoardCols+GoblinX].Walkable) &&
            (MapdPathListToPlayer[(GoblinY - 1)*BoardCols+GoblinX] < TargetTile.Count) ||
            (TargetTile.Count == -1))
        {
            TargetTile = {X: GoblinX, Y: GoblinY - 1, Count: MapdPathListToPlayer[(GoblinY - 1)*BoardCols+GoblinX]};
        }
    }

    const dX = PlayerX - GoblinX;
    const dY = PlayerY - GoblinY;
    const Distance = Math.sqrt(dX*dX + dY*dY);
    if (Distance <= GoblinAggroDist)
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

    // HACK(cjb): just set value to space
    Board[PlayerY*BoardCols+PlayerX].Value = TileType.Space; // Example of issue with player being apart of board
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
    if (Board[PlayerY*BoardCols + PlayerX + dPlayerX].Walkable)
    {
        PlayerX += dPlayerX;
    }
    if (Board[(PlayerY+dPlayerY)*BoardCols + PlayerX].Walkable)
    {
        PlayerY += dPlayerY;
    }
    Board[PlayerY*BoardCols+PlayerX].Value = TileType.Player;
    const MapdPathListToPlayer = DistanceMapFromTarget(PlayerX, PlayerY);

/***
* Update lighting
*/
    UpdateEnemy(MapdPathListToPlayer);
    Draw(MapdPathListToPlayer);
}

function RegisterInputHandlers(): void
{
    window.addEventListener("keyup", PlayerMoveHandler);
}

