function chessMoveUpdateTimer() {
    jQuery('.chess-move span.time').html(parseInt(jQuery('.chess-move span.time').html()) + 1);
}

(function( chessMove, $, undefined ) {
    var playArea = new Array(64);

    var debug = false;
    var gameOver = true;
    var timerID = null;

    var KING = 'King';
    var QUEEN = 'Queen';
    var ROOK = 'Rook';
    var KNIGHT = 'Knight';
    var BISHOP = 'Bishop';
    var PAWN = 'Pawn';

    var LIGHT_YELLOW = '#000';
    var BROWN = '#fff';

    var BLACK = 1;
    var WHITE = 2;
    var OPEN = 2;
    var X = 0;
    var Y = 1;

    var currentColor = WHITE;

    var TIME = 20000;

    var pollInvitation = null;
    var invitationID = null
    var dropEnabled = new Array();
    var clickedItem = null;
    var drag = '';


    // CLASSES

    var Shape = {
        id: null,
        color: null,
        occupied: false,
        virtualColor: null,
        moveCount: 0,
        priority: 0
    }

    var Empty = {
        name: null
    }

    var Bishop = {
        name: BISHOP,
        priority: 3,
        img: function() {
            return this.color == WHITE ? '&#9815' : '&#9821';
        },
        inDanger: function(toIndex) {
            var danger = false;

            var toPiece = playArea[toIndex];

            if(toPiece.name != null && this.color != toPiece.color && (toPiece.name == BISHOP || toPiece.name == QUEEN)) {
                danger = true;
            }

            return danger;
        },
        method: function(toIndex) {
            var toPiece = playArea[toIndex];
            var index = getThePieceIndex(this);

            if(toPiece.name == null || this.color != toPiece.color) {
                if(!validate(index, toIndex)) {
                    toPiece.occupied = true;
                    toPiece.virtualColor = 'green';
                }
            }
        },
        move: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;

            var a = (this.color == WHITE) ? WHITE : BLACK;
            var b = (this.color == WHITE) ? BLACK : WHITE;

            var x = xy[X];
            var y = xy[Y];

            while(x != 7 && y != 0) {
                toIndex = fromXY(x + 1, y - 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                x ++;
                y --;
            }

            x = xy[X];
            y = xy[Y];

            while(x != 7 && y != 7) {
                toIndex = fromXY(x + 1, y + 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                x ++;
                y ++;
            }

            x = xy[X];
            y = xy[Y];

            while(x != 0 && y != 7) {
                toIndex = fromXY(x - 1, y + 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                x --;
                y ++;
            }

            x = xy[X];
            y = xy[Y];

            while(x != 0 && y != 0) {
                toIndex = fromXY(x - 1, y - 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                x = x - 1;
                y = y - 1;
            }
        },
        danger: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;

            var toIndex;

            var a = (this.color == WHITE) ? WHITE : BLACK;
            var b = (this.color == WHITE) ? BLACK : WHITE;

            var x = xy[X];
            var y = xy[Y];

            while(x != 7 && y != 0) {
                toIndex = fromXY(x + 1, y - 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                x ++;
                y --;
            }

            x = xy[X];
            y = xy[Y];

            while(x != 7 && y != 7) {
                toIndex = fromXY(x + 1, y + 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                x ++;
                y ++;
            }

            x = xy[X];
            y = xy[Y];

            while(x != 0 && y != 7) {
                toIndex = fromXY(x - 1, y + 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                x --;
                y ++;
            }

            x = xy[X];
            y = xy[Y];

            while(x != 0 && y != 0) {
                toIndex = fromXY(x - 1, y - 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                x = x - 1;
                y = y - 1;
            }

            return false;
        }
    }

    var King = {
        name: KING,
        isCastlingLeft: false,
        isCastlingRight: false,
        priority: 6,
        img: function() {
            return this.color == WHITE ? '&#9812' : '&#9818';
        },
        inDanger: function(toIndex) {
            var danger = false;

            var toPiece = playArea[toIndex];

            if(toPiece.name != null && this.color != toPiece.color && toPiece.name == KING) {
                danger = true;
            }

            return danger;
        },
        method: function(toIndex) {
            var toPiece = playArea[toIndex];
            var index = getThePieceIndex(this);

            if(toPiece.name == null || this.color != toPiece.color) {
                if(!validate(index, toIndex)) {
                    toPiece.occupied = true;
                    toPiece.virtualColor = 'green';
                }
            }
        },
        move: function() {
            var xy = toXY(getThePieceIndex(this));

            var toIndex;

            var x = xy[X];
            var y = xy[Y] - 1;

            if(y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] - 1;
            y = xy[Y] - 1;

            if(x >= 0 && y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] - 1;
            y = xy[Y];

            if(x >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] - 1;
            y = xy[Y] + 1;

            if(x >= 0 && y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X];
            y = xy[Y] + 1;

            if(y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 1;
            y = xy[Y] + 1;

            if(x <= 7 && y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 1;
            y = xy[Y];

            if(x <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 1;
            y = xy[Y] - 1;

            if(x <= 7 && y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            this.castlingLeft();
            this.castlingRight();
        },
        danger: function() {
            var xy = toXY(getThePieceIndex(this));

            var toIndex;

            var x = xy[X];
            var y = xy[Y] - 1;

            if(y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] - 1;
            y = xy[Y] - 1;

            if(x >= 0 && y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] - 1;
            y = xy[Y];

            if(x >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] - 1;
            y = xy[Y] + 1;

            if(x >= 0 && y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X];
            y = xy[Y] + 1;

            if(y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 1;
            y = xy[Y] + 1;

            if(x <= 7 && y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 1;
            y = xy[Y];

            if(x <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 1;
            y = xy[Y] - 1;

            if(x <= 7 && y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            return false;
        },
        castlingLeft: function() {
            var x = 4;
            var y = (this.color == BLACK) ? 0: 7;

            var index1 = fromXY(x - 1, y);
            var index2 = fromXY(x - 2, y);
            var index3 = fromXY(x - 3, y);
            var index4 = fromXY(x - 4, y);

            var square1 = playArea[index1];
            var square2 = playArea[index2];
            var square3 = playArea[index3];
            var square4 = playArea[index4];

            var pass = true;
            var toIndex;
            var toSquare;
            var index = getThePieceIndex(this);

            if(this.moveCount == 0 && square1.name == null && square2.name == null && square3.name == null && square4.name == ROOK && square4.color == this.color && square4.moveCount == 0) {
                for(var i = 1; i < 5; i ++) {
                    toIndex = fromXY(x - i, y);
                    toSquare = playArea[toIndex];

                    playArea[index] = toSquare;
                    playArea[toIndex] = this;

                    if(pieceInDanger(toIndex)) {
                        pass = false;
                    }

                    playArea[index] = this;
                    playArea[toIndex] = toSquare;

                    if (!pass) {
                        break;
                    }
                }

                if(pass) {
                    toSquare.occupied = true;
                    toSquare.virtualColor = 'blue';
                    this.isCastlingLeft = true;
                }
            }
        },
        castlingRight: function() {
            var x = 4;
            var y = (this.color == BLACK) ? 0: 7;

            var index1 = fromXY(x + 1, y);
            var index2 = fromXY(x + 2, y);
            var index3 = fromXY(x + 3, y);

            var square1 = playArea[index1];
            var square2 = playArea[index2];
            var square3 = playArea[index3];

            var pass = true;
            var toIndex;
            var toSquare;
            var index = getThePieceIndex(this);

            if(this.moveCount == 0 && square1.name == null && square2.name == null && square3.name == ROOK && square3.color == this.color && square3.moveCount == 0) {
                for(var i = 1; i < 4; i ++) {
                    toIndex = fromXY(x + i, y);
                    toSquare = playArea[toIndex];

                    playArea[index] = toSquare;
                    playArea[toIndex] = this;

                    if(pieceInDanger(toIndex)) {
                        pass = false;
                    }

                    playArea[index] = this;
                    playArea[toIndex] = toSquare;

                    if (!pass) {
                        break;
                    }
                }

                if(pass) {
                    toSquare.occupied = true;
                    toSquare.virtualColor = 'blue';
                    this.isCastlingRight = true;
                }
            }
        }
    }

    var Knight = {
        name: KNIGHT,
        priority: 2,
        img: function() {
            return this.color == WHITE ? '&#9816' : '&#9822';
        },
        inDanger: function(toIndex) {
            var danger = false;

            var toPiece = playArea[toIndex];

            if(toPiece.name != null && this.color != toPiece.color && toPiece.name == KNIGHT) {
                danger = true;
            }

            return danger;
        },
        method: function(toIndex) {
            var toPiece = playArea[toIndex];
            var index = getThePieceIndex(this);

            if(toPiece.name == null || this.color != toPiece.color) {
                if(!validate(index, toIndex)) {
                    toPiece.occupied = true;
                    toPiece.virtualColor = 'green';
                }
            }
        },
        move: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;

            var x = xy[X] - 2;
            var y = xy[Y] - 1;

            if(x >= 0 && y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] - 1;
            y = xy[Y] - 2;

            if(x >= 0 && y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 1;
            y = xy[Y] - 2;

            if(x <= 7 && y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 2;
            y = xy[Y] - 1;

            if(x <= 7 && y >= 0) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 2;
            y = xy[Y] + 1;

            if(x <= 7 && y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] + 1;
            y = xy[Y] + 2;

            if(x <= 7 && y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] - 1;
            y = xy[Y] + 2;

            if(x >= 0 && y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }

            x = xy[X] - 2;
            y = xy[Y] + 1;

            if(x >= 0 && y <= 7) {
                toIndex = fromXY(x, y);
                this.method(toIndex);
            }
        },
        danger: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;

            var x = xy[X] - 2;
            var y = xy[Y] - 1;

            if(x >= 0 && y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] - 1;
            y = xy[Y] - 2;

            if(x >= 0 && y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 1;
            y = xy[Y] - 2;

            if(x <= 7 && y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 2;
            y = xy[Y] - 1;

            if(x <= 7 && y >= 0) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 2;
            y = xy[Y] + 1;

            if(x <= 7 && y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] + 1;
            y = xy[Y] + 2;

            if(x <= 7 && y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] - 1;
            y = xy[Y] + 2;

            if(x >= 0 && y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            x = xy[X] - 2;
            y = xy[Y] + 1;

            if(x >= 0 && y <= 7) {
                toIndex = fromXY(x, y);
                if(this.inDanger(toIndex)) {
                    return true;
                }
            }

            return false;
        }
    }

    var Pawn = {
        name: PAWN,
        enPassantIndex: null,
        priority: 1,
        img: function() {
            return this.color == WHITE ? '&#9817' : '&#9823';
        },
        inDanger: function(toIndex) {
            var danger = false;

            var toPiece = playArea[toIndex];

            if(toPiece.name != null && this.color != toPiece.color && toPiece.name == PAWN) {
                danger = true;
            }

            return danger;
        },
        method1: function(toIndex, toIndex2) {
            var toPiece = playArea[toIndex];
            var toPiece2 = playArea[toIndex2];
            var index = getThePieceIndex(this);

            if(toPiece.name == null && toPiece2.name == null && !validate(index, toIndex)) {
                toPiece.occupied = true;
                toPiece.virtualColor = 'green';
            }
        },
        method2: function(toIndex) {
            var toPiece = playArea[toIndex];
            var index = getThePieceIndex(this);

            if(toPiece.name == null && !validate(index, toIndex)) {
                toPiece.occupied = true;
                toPiece.virtualColor = 'green';
            }
        },
        method3: function(toIndex) {
            var toPiece = playArea[toIndex];
            var index = getThePieceIndex(this);

            if(toPiece.name != null && this.color != toPiece.color) {
                if(!validate(index, toIndex)) {
                    toPiece.occupied = true;
                    toPiece.virtualColor = 'green';
                }
            }
        },
        enPassant: function(toIndex, possiblePiece) {
            var pass = true;
            var index = getThePieceIndex(this);
            var possiblePieceIndex = getThePieceIndex(possiblePiece);
            var toPiece = playArea[toIndex];

            playarea[index] = $.extend({}, Shape, Empty);
            playarea[toIndex] = this;
            playarea[possiblePieceIndex] = $.extend({}, Shape, Empty);

            if(pieceInDanger(getTheKingIndex(this.color))) {
                pass = false;
            }

            playarea[index] = this;
            playarea[toIndex] = $.extend({}, Shape, Empty);
            playarea[possiblePieceIndex] = possiblePiece;

            if(pass) {
                toPiece.occupied = true;
                toPiece.virtualColor = 'blue';
                this.enPassantIndex = possiblePieceIndex;
            }
        },
        move: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;
            var possiblePieceIndex;
            var possiblePiece;
            var toIndex2;

            if(this.color == WHITE) {
                if(xy[Y] == 6) {

                    toIndex = fromXY(xy[X], xy[Y] - 2);
                    toIndex2 = fromXY(xy[X], xy[Y] - 1);
                    this.method1(toIndex, toIndex2);
                }

                if(xy[Y] != 0) {
                    toIndex = fromXY(xy[X], xy[Y] - 1);
                    this.method2(toIndex);
                }

                if(xy[X] != 0 && xy[Y] != 0) {
                    toIndex = fromXY(xy[X] - 1, xy[Y] - 1);
                    this.method3(toIndex);
                }

                if(xy[X] != 7 && xy[Y] != 0) {
                    toIndex = fromXY(xy[X] + 1, xy[Y] - 1);
                    this.method3(toIndex);
                }

                if(xy[X] != 0 && xy[Y] != 0) {
                    toIndex = fromXY(xy[X] - 1, xy[Y] - 1);
                    toPiece = playArea[toIndex];
                    possiblePieceIndex = fromXY(xy[X] - 1, xy[Y]);
                    possiblePiece = playArea[possiblePieceIndex];

                    if(possiblePiece.name == PAWN && possiblePiece.color == BLACK && possiblePiece.moveCount == 1 && toPiece.name == null) {
                        this.enPassant(toIndex, possiblePiece);
                    }
                }

                if(xy[X] != 7 && xy[Y] != 0) {
                    toIndex = fromXY(xy[X] + 1, xy[Y] - 1);
                    toPiece = playArea[toIndex];
                    possiblePieceIndex = fromXY(xy[X] + 1, xy[Y]);
                    possiblePiece = playArea[possiblePieceIndex];

                    if(possiblePiece.name == PAWN && possiblePiece.color == BLACK && possiblePiece.moveCount == 1 && toPiece.name == null) {
                        this.enPassant(toIndex, possiblePiece);
                    }
                }
            } else {
                if(xy[Y] == 1) {
                    toIndex = fromXY(xy[X], xy[Y] + 2);
                    toIndex2 = fromXY(xy[X], xy[Y] + 1);
                    this.method1(toIndex, toIndex2);
                }

                if(xy[Y] != 7) {
                    toIndex = fromXY(xy[X], xy[Y] + 1);
                    this.method2(toIndex);
                }

                if(xy[X] != 0 && xy[Y] != 7) {
                    toIndex = fromXY(xy[X] - 1, xy[Y] + 1);
                    this.method3(toIndex);
                }

                if(xy[X] != 7 && xy[Y] != 7) {
                    toIndex = fromXY(xy[X] + 1, xy[Y] + 1);
                    this.method3(toIndex);
                }

                if(xy[X] != 0 && xy[Y] != 7) {
                    toIndex = fromXY(xy[X] - 1, xy[Y] + 1);
                    toPiece = playArea[toIndex];
                    possiblePieceIndex = fromXY(xy[X] - 1, xy[Y]);
                    possiblePiece = playArea[possiblePieceIndex];

                    if(possiblePiece.name == PAWN && possiblePiece.color == WHITE && possiblePiece.moveCount == 1 && toPiece.name == null) {
                        this.enPassant(toIndex, possiblePiece);
                    }
                }

                if(xy[X] != 7 && xy[Y] != 7) {
                    toIndex = fromXY(xy[X] + 1, xy[Y] + 1);
                    toPiece = playArea[toIndex];
                    possiblePieceIndex = fromXY(xy[X] + 1, xy[Y]);
                    possiblePiece = playArea[possiblePieceIndex];

                    if(possiblePiece.name == PAWN && possiblePiece.color == WHITE && possiblePiece.moveCount == 1 && toPiece.name == null) {
                        this.enPassant(toIndex, possiblePiece);
                    }
                }
            }
        },
        danger: function() {
            var index = getThePieceIndex(this);
            var xy = toXY(index);

            var toIndex;

            if(this.color == WHITE) {
                if(xy[X] != 0 && xy[Y] != 0) {
                    toIndex = fromXY(xy[X] - 1, xy[Y] - 1);
                    if(this.inDanger(toIndex)) {
                        return true;
                    }
                }

                if(xy[X] != 7 && xy[Y] != 0) {
                    toIndex = fromXY(xy[X] + 1, xy[Y] - 1);
                    if(this.inDanger(toIndex)) {
                        return true;
                    }
                }
            } else {
                if(xy[X] != 0 && xy[Y] != 7) {
                    toIndex = fromXY(xy[X] - 1, xy[Y] + 1);
                    if(this.inDanger(toIndex)) {
                        return true;
                    }
                }

                if(xy[X] != 7 && xy[Y] != 7) {
                    toIndex = fromXY(xy[X] + 1, xy[Y] + 1);
                    if(this.inDanger(toIndex)) {
                        return true;
                    }
                }

            }

            return false;
        }
    }

    var Queen = {
        name: QUEEN,
        priority: 5,
        img: function() {
            return this.color == WHITE ? '&#9813' : '&#9819';
        },
        move: function() {
            var rook = $.extend({}, Shape, Rook);
            rook.id = this.id;
            rook.color = this.color;
            rook.move();

            var bishop = $.extend({}, Shape, Bishop);
            bishop.id = this.id;
            bishop.color = this.color;
            bishop.move();
        },
        danger: function() {
            var danger;

            var rook = $.extend({}, Shape, Rook);
            rook.id = this.id;
            rook.color = this.color;

            danger = rook.danger();

            if(danger) {
                return danger;
            }

            var bishop = $.extend({}, Shape, Bishop);
            bishop.id = this.id;
            bishop.color = this.color;

            danger = bishop.danger();

            return danger;
        }
    }

    var Rook = {
        name: ROOK,
        priority: 4,
        img: function() {
            return this.color == WHITE ? '&#9814' : '&#9820';
        },
        inDanger: function(toIndex) {
            var danger = false;

            var toPiece = playArea[toIndex];

            if(toPiece.name != null && this.color != toPiece.color && (toPiece.name == ROOK || toPiece.name == QUEEN)) {
                danger = true;
            }

            return danger;
        },
        method: function(toIndex) {
            var toPiece = playArea[toIndex];
            var index = getThePieceIndex(this);

            if(toPiece.name == null || this.color != toPiece.color) {
                if(!validate(index, toIndex)) {
                    toPiece.occupied = true;
                    toPiece.virtualColor = 'green';
                }
            }
        },
        move: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;

            var a = (this.color == WHITE) ? WHITE : BLACK;
            var b = (this.color == WHITE) ? BLACK : WHITE;

            var x = xy[X];
            var y = xy[Y];

            while(x != 7) {
                toIndex = fromXY(x + 1, xy[Y]);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                x ++;
            }

            x = xy[X];

            while(x != 0) {
                toIndex = fromXY(x - 1, xy[Y]);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                x --;
            }

            while(y != 7) {
                toIndex = fromXY(xy[X], y + 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);

                if(toPiece.color == b) {
                    break;
                }

                y ++;
            }

            y = xy[Y];

            while(y != 0) {
                toIndex = fromXY(xy[X], y - 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                this.method(toIndex);
                if(toPiece.color == b) {
                    break;
                }

                y --;
            }
        },
        danger: function() {
            var xy = toXY(getThePieceIndex(this));
            var toIndex;
            var toPiece;

            var a = (this.color == WHITE) ? WHITE : BLACK;
            var b = (this.color == WHITE) ? BLACK : WHITE;

            var x = xy[X];
            var y = xy[Y];

            while(x != 7) {
                toIndex = fromXY(x + 1, xy[Y]);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                x ++;
            }

            x = xy[X];

            while(x != 0) {
                toIndex = fromXY(x - 1, xy[Y]);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                x --;
            }

            while(y != 7) {
                toIndex = fromXY(xy[X], y + 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                y ++;
            }

            y = xy[Y];

            while(y != 0) {
                toIndex = fromXY(xy[X], y - 1);
                toPiece = playArea[toIndex];

                if(toPiece.color == a) {
                    break;
                }

                if(this.inDanger(toIndex)) {
                    return true;
                }

                if(toPiece.color == b) {
                    break;
                }

                y --;
            }
            return false;
        }
    }

    // CLASSES END

    var emptyPiece = '&nbsp;';

    function debugPlayArea() {
        var str = '';
        var index = null;
        var color = null;

        for(var y = 0; y < 8; y ++) {
            str = '';

            for(var x = 0; x < 8; x ++) {
                index = fromXY(x, y);
                color = null

                if(playArea[index].color == WHITE) {
                    color = 'White';
                }
                if(playArea[index].color == BLACK) {
                    color = 'Black';
                }

                str += color + ' ' + playArea[index].name + ' - ';
            }

        }
    }

    function isCheckMate(color) {
        var piece;
        var random = new Array();
        dropEnabled = new Array();

        for(var i = 0; i < playArea.length; i ++) {
            piece = playArea[i];

            if(piece.color == color) {
                for(var j = 0; j < playArea.length; j ++) {
                    playArea[j].occupied = false;
                }
                piece.move();
                setDrop(false);

                if(dropEnabled.length > 0) {
                    random.push(i);
                }
            }
        }
        if(random.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    function toXY(position) {
        var i = 0;

        for(var y = 0; y < 8; y ++) {
            for(var x = 0; x < 8; x ++) {
                if(position == i) {
                    return new Array(x, y);
                }
                i ++;
            }
        }
    }

    function fromXY(x, y) {
        var k = 0;
        for(var i = 0; i < 8; i ++) {
            for(var j = 0; j < 8; j ++) {
                if(i == y && j == x) {
                    return k;
                }
                k ++;
            }
        }
        return false;
    }

    function validate(fromIndex, toIndex) {
        var danger = false;
        var tempFromPiece = playArea[fromIndex];
        var tempToPiece = playArea[toIndex];
        var kingIndex = getTheKingIndex(tempFromPiece.color);

        if(fromIndex == kingIndex) {
            kingIndex = toIndex;
        }

        playArea[fromIndex] = $.extend({}, Shape, Empty);
        playArea[toIndex] = tempFromPiece;

        if(pieceInDanger(kingIndex)) {
            danger = true;
        }

        playArea[fromIndex] = tempFromPiece;
        playArea[toIndex] = tempToPiece;

        return danger;
    }

    function pieceInDanger(index) {
        var piece = playArea[index];

        var pawn = $.extend({}, Shape, Pawn);
        pawn.id = piece.id, pawn.color = piece.color;
        playArea[index] = pawn;

        if(pawn.danger()) {
            playArea[index] = piece;
            return true;
        }

        var queen = $.extend({}, Shape, Queen);
        queen.id = piece.id, queen.color = piece.color;
        playArea[index] = queen;

        if(queen.danger()) {
            playArea[index] = piece;
            return true;
        }

        var knight = $.extend({}, Shape, Knight);
        knight.id = piece.id, knight.color = piece.color;
        playArea[index] = knight;

        if(knight.danger()) {
            playArea[index] = piece;
            return true;
        }

        var king = $.extend({}, Shape, King);
        king.id = piece.id, king.color = piece.color;
        playArea[index] = king;

        if(king.danger()) {
            playArea[index] = piece;
            return true;
        }

        playArea[index] = piece;

        return false;
    }

    function inArray(key, array) {
        for(var i = 0; i < array.length; i ++) {
            if(array[i] == key) {
                return true;
            }
        }
        return false;
    }

    function assignDrop(drop) {
        jQuery.each(jQuery('.chess-move .block'), function(k, v) {
            var index = getBlockIndexFromClass(jQuery(v));
            jQuery(document).on('click', '.chess-move .block_' + index, function() {
               if(inArray(index, dropEnabled)) {
                    if(gameOver) {
                        gameOver = false;
                        timerID = setInterval('chessMoveUpdateTimer()', 1000)
                    }

                    dropEnabled = new Array();
                    setBackgrounds();

                    var to = getBlockIndexFromClass(jQuery(v));
                    var from = getBlockIndexFromClass(clickedItem);
                    var temp = clickedItem.clone();
                    var castled = false;

                    if(playArea[from].name == KING && (playArea[from].isCastlingLeft || playArea[from].isCastlingRight) && playArea[to].name == ROOK) {
                        jQuery(clickedItem).html(jQuery(v).text());
                        playArea[from].isCastlingLeft = false;
                        playArea[from].isCastlingRight = false;
                        castled = true;
                    }

                    if(playArea[from].name == PAWN && playArea[from].enPassantIndex != null && playArea[playArea[from].enPassantIndex].name == PAWN) {
                        var enPassant = jQuery('.chess-move .block_' + playArea[from].enPassantIndex);
                        enPassant.html(emptyPiece);
                        playArea[from].enPassantIndex = null;
                    }

                    clickedItem = null;

                    jQuery(v).html(temp.text());

                    resetZIndex();

                    move = getMove(playArea[from], from, to);

                    temp = $.extend({}, Shape, Empty);

                    if(castled) {
                        temp = playArea[to];
                    } else {
                        jQuery('.chess-move .block_' + from).html(emptyPiece);
                    }

                    playArea[to] = playArea[from];
                    playArea[from] = temp;

                    var response;

                    if(isCheckMate(BLACK)) {
                        clearInterval(timerID);
                    }

                    for(var i = 0; i < playArea.length; i ++) {
                        playArea[i].occupied = false;
                    }

                    var kingColor = currentColor == WHITE ? BLACK : WHITE;
                    var kingIndex = getTheKingIndex(kingColor);

                    if(pieceInDanger(kingIndex)) {
                        jQuery('.chess-move .block_' + kingIndex).css('background-color', 'red');
                    }

                    playArea[to].moveCount += 1;
                    currentColor = BLACK;

                    var move = artificialIntelligence();

                    jQuery('.chess-move .block_' + move[1]).html(jQuery('.chess-move .block_' + move[0]).text());
                    jQuery('.chess-move .block_' + move[0]).html(emptyPiece);
                    playArea[move[1]] = playArea[move[0]];
                    playArea[move[0]] = $.extend({}, Shape, Empty);
                    playArea[move[1]].moveCount ++;

                    var warningPiece = $('.chess-move .block_' + move[1]);
                    warningPiece.css('background-color', 'orange');
                    warningPiece.css({'z-index': 1});

                    currentColor = WHITE;
                    if(isCheckMate(WHITE)) {
                        jQuery('.area').html('<h1>You Loose!</h1>');
                    }
                    dropEnabled = new Array();
                    for(var j = 0; j < playArea.length; j ++) {
                        playArea[j].occupied = false;
                    }
                    getActivePiecesAsString();
                }
            });
        });
    }

    function artificialIntelligence() {
        var priority = new Array(
            new Array(),
            new Array(),
            new Array(),
            new Array(),
            new Array(),
            new Array()
        );

        for(i = 0; i < playArea.length; i ++) {
            if(playArea[i].color == BLACK) {
                priority[playArea[i].priority - 1].push(i);
            }
        }

        for(i = 0; i < priority.length; i ++) {
            priority[i].sort(function() { return 0.5 - Math.random() });
        }

        var priorityList = new Array();

        for(i = 0; i < priority.length; i ++) {
            for(var j = 0; j < priority[i].length; j ++) {
                priorityList.push(priority[i][j]);
            }
        }

        priorityList = priorityList.reverse();
        console.log(priorityList);
        var fromIndex = null;
        var temp = null;
        var temp2 = null;
        var futureMove = null;
        var move = null;
        var d = null;
        var dropTemp = new Array();

        for(var i = 0; i < priorityList.length; i ++) {
            fromIndex = priorityList[i];

            var xy = toXY(fromIndex);
            toIndex = xy[Y] == 7 ? null : fromXY(xy[X], xy[Y] + 1);

            var possiblePawn = toIndex == null ? null : playArea[toIndex];

            var danger = pieceInDanger(fromIndex);

            if(danger) {
                for(var j = 0; j < playArea.length; j ++) {
                    playArea[j].occupied = false;
                }
                playArea[fromIndex].move();
                setDrop(false);

                if(dropEnabled.length > 0) {
                    var moves = new Array();

                    for(j = 0; j < dropEnabled.length; j ++) {
                        var movePriority = 0;

                        temp = playArea[fromIndex];
                        playArea[fromIndex] = $.extend({}, Shape, Empty);
                        temp2 = playArea[dropEnabled[j]];
                        playArea[dropEnabled[j]] = temp;
                        d = dropEnabled[j];

                        if(playArea[d].name != null) {
                            movePriority = playArea[d].priority;
                        }

                        moves.push(new Move(d, pieceInDanger(d), movePriority));

                        playArea[fromIndex] = temp;
                        playArea[dropEnabled[j]] = temp2;
                    }

                    var currentMove = moves[0];

                    for(var j = 1; j < moves.length; j ++) {
                        if(playArea[moves[j].index].color == WHITE && moves[j].priority >= currentMove.priority) {
                            currentMove = moves[j];
                        }
                    }
                    return new Array(fromIndex, currentMove.index);
                }
            }
        }

        var run = true;
        var random = new Array();

        for(var i = 0; i < playArea.length; i ++) {
            piece = playArea[i];
            if(piece.color == BLACK) {
                for(var j = 0; j < playArea.length; j ++) {
                    playArea[j].occupied = false;
                }
                piece.move();
                setDrop(false);

                if(dropEnabled.length > 0) {
                    random.push(i);
                }
            }
        }

        var index;

        while (run) {
            if(random.length > 0) {
                var r = Math.floor((Math.random() * random.length) + 1);

                fromIndex = random[r - 1];

                for(var j = 0; j < playArea.length; j ++) {
                    playArea[j].occupied = false;
                }

                playArea[fromIndex].move();
                setDrop(false);

                if(dropEnabled.length > 0) {
                    return new Array(fromIndex, dropEnabled[0]);
                } else {
                    var index = 0;
                    for (var m = 0; m < random.length; m ++) {
                        if(random[m] == r) {
                            index = m;
                        }
                    }
                    random.remove(index);
                    random.sort();
                }
            } else {
                return new Array(fromIndex, dropEnabled[0]);
            }
        }
    }

    var Move = function (index, danger, priority) {
        this.index = index;
        this.danger = danger;
        this.priority = priority;
    }

    function getMove(fromObj, from, to) {
        var color = fromObj.color == WHITE ? 'White': 'Black';

        return color + ' ' + fromObj.name + ' : ' + getChessMove(from, to);
    }

    function getChessMove(from, to) {
        var y = new Array('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h');
        var x = new Array(1, 2, 3, 4, 5, 6, 7, 8);

        var from = toXY(from);
        var to = toXY(to);

        return y[from[1]] + '' + x[from[0]] + ' - ' + y[to[1]] + '' + x[to[0]]
    }

    function getBlockIndexFromClass(element) {
        var array = element.attr('class').split(' ');

        for(var i = 0; i < array.length; i ++) {
            var parts = array[i].split('_')
            if(parts.length > 1) {
                return parseInt(parts[1])
            }
        }
    }

    function assignDrag()  {
        jQuery(document).on('click', '.chess-move .block', function() {
            var index = getBlockIndexFromClass($(this));
            var from = clickedItem == null ? null : getBlockIndexFromClass(clickedItem);

            if(inArray(index, dragEnabled)) {
                if(from != null && (playArea[from].isCastlingLeft || playArea[from].isCastlingRight) && playArea[index].name == ROOK) {
                } else {
                    setBackgrounds();
                    clickedItem = jQuery(this);
                    jQuery(this).css({'z-index': 1});

                    var block = playArea[index];
                    for(var i = 0; i < playArea.length; i ++) {
                        playArea[i].occupied = false;
                    }
                    block.move();

                    var piece;
                    var drop = '';
                    var key;

                    var drop = setDrop(true);

                    if(drop != '') {
                        drop = drop.substring(0, drop.length - 2)
                        assignDrop(drop);
                        jQuery(drag).unbind('click');
                    }
                }
            }
        });
    }

    function setDrop(placeholders) {
        var drop = '';

        dropEnabled = new Array();

        for(var i = 0; i < playArea.length; i ++) {
            piece = playArea[i];
            if(piece.occupied) {
                key = '.chess-move .block_' + i;

                drop += key + ', ';
                dropEnabled.push(i);
                if(placeholders) {
                    $(key).css('background-color', piece.virtualColor);
                }
            }
        }

        return drop;
    }

    function resetZIndex() {
        for(var i = 0; i < playArea.length; i ++) {
            jQuery('.chess-move .block_' + i).css('z-index', 0);
        }
    }

    function setBackgrounds() {
        var color;

        for(var i = 0; i < 8; i ++) {
            if(i % 2 == 0)  {
                color = LIGHT_YELLOW;
            } else {
                color = BROWN;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 8; i < 16; i ++) {
            if(i % 2 == 0)  {
                color = BROWN;
            } else {
                color = LIGHT_YELLOW;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 16; i < 24; i ++) {
            if(i % 2 == 0)  {
                color = LIGHT_YELLOW;
            } else {
                color = BROWN;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 24; i < 32; i ++) {
            if(i % 2 == 0)  {
                color = BROWN;
            } else {
                color = LIGHT_YELLOW;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 32; i < 40; i ++) {
            if(i % 2 == 0)  {
                color = LIGHT_YELLOW;
            } else {
                color = BROWN;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 40; i < 48; i ++) {
            if(i % 2 == 0)  {
                color = BROWN;
            } else {
                color = LIGHT_YELLOW;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 48; i < 56; i ++) {
            if(i % 2 == 0)  {
                color = LIGHT_YELLOW;
            } else {
                color = BROWN;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }

        for(var i = 56; i < 64; i ++) {
            if(i % 2 == 0)  {
                color = BROWN;
            } else {
                color = LIGHT_YELLOW;
            }
            jQuery('.chess-move .block_' + i).css('background-color', color);
        }
    }

    function getActivePiecesAsString() {
        drag = '';
        dragEnabled = new Array();

        for(var i = 0; i < playArea.length; i ++) {
            if(playArea[i].color == currentColor) {
                drag += '.chess-move .block_' + i + ', ';
                dragEnabled.push(i);
            }
        }

        drag = drag.substring(0, drag.length - 2);
    }

    function getTheKingIndex(color) {
        for(var i = 0; i < playArea.length; i ++) {
            if(playArea[i].color == color && playArea[i].name == KING) {
                return i;
            }
        }
    }

    function getThePieceIndex(piece) {
        for(var i = 0; i < playArea.length; i ++) {
            if(playArea[i].id == piece.id) {
                return i;
            }
        }
    }

    chessMove.initPlayArea = function() {
        playArea[0] = $.extend({}, Shape, Rook);
        playArea[0].id = 0;
        playArea[0].color = BLACK;

        playArea[7] = $.extend({}, Shape, Rook);
        playArea[7].id = 7;
        playArea[7].color = BLACK;

        playArea[1] = $.extend({}, Shape, Knight);
        playArea[1].id = 1;
        playArea[1].color = BLACK;

        playArea[6] = $.extend({}, Shape, Knight);
        playArea[6].id = 6;
        playArea[6].color = BLACK;

        playArea[2] = $.extend({}, Shape, Bishop);
        playArea[2].id = 2;
        playArea[2].color = BLACK;

        playArea[5] = $.extend({}, Shape, Bishop);
        playArea[5].id = 5;
        playArea[5].color = BLACK;

        playArea[3] = $.extend({}, Shape, Queen);
        playArea[3].id = 3;
        playArea[3].color = BLACK;

        playArea[4] = $.extend({}, Shape, King);
        playArea[4].id = 4;
        playArea[4].color = BLACK;

        for(var i = 8; i < 16; i ++) {
            playArea[i] = $.extend({}, Shape, Pawn);
            playArea[i].id = i;
            playArea[i].color = BLACK;
        }

        for(var i = 16; i < 48; i ++) {
            playArea[i] = $.extend({}, Shape, Empty);
            playArea[i].id = i;
        }

        playArea[56] = $.extend({}, Shape, Rook);
        playArea[56].id = 56;
        playArea[56].color = WHITE;

        playArea[63] = $.extend({}, Shape, Rook);
        playArea[63].id = 63;
        playArea[63].color = WHITE;

        playArea[57] = $.extend({}, Shape, Knight);
        playArea[57].id = 57;
        playArea[57].color = WHITE;

        playArea[62] = $.extend({}, Shape, Knight);
        playArea[62].id = 62;
        playArea[62].color = WHITE;

        playArea[58] = $.extend({}, Shape, Bishop);
        playArea[58].id = 58;
        playArea[58].color = WHITE;

        playArea[61] = $.extend({}, Shape, Bishop);
        playArea[61].id = 61;
        playArea[61].color = WHITE;

        playArea[59] = $.extend({}, Shape, Queen);
        playArea[59].id = 59;
        playArea[59].color = WHITE;

        playArea[60] = $.extend({}, Shape, King);
        playArea[60].id = 60;
        playArea[60].color = WHITE;

        for(var i = 48; i < 56; i ++) {
            playArea[i] = $.extend({}, Shape, Pawn);
            playArea[i].id = i;
            playArea[i].color = WHITE;
        }

        getActivePiecesAsString();
        assignDrag();
    }

    chessMove.adaptToResponse = function () {
        jQuery('.chess-move .block').css({'font-size': jQuery('.chess-move .block').width() - 5 + 'px', 'line-height': jQuery('.chess-move .block').width() + 'px', 'color': '#666'});
        jQuery('.chess-move .block').height(jQuery('.chess-move .block').width());
    }
}( window.chessMove = window.chessMove || {}, jQuery));

jQuery(window).resize(function() {
    chessMove.adaptToResponse();
});

jQuery(document).ready(function() {
    chessMove.initPlayArea();
    chessMove.adaptToResponse();
});