Array.prototype.getnkill = function () {
  var a = Math.floor(Math.random() * this.length);
  var dead = this[a];
  this.splice(a, 1);
  return dead;
}

function genRandAwAch() {
  let allAchievements = Array.from({ length: 16 }, (x, i) => i);
  allAchievements.splice(12, 1);
  let allAwards = Array.from({ length: 12 }, (x, i) => i + 16);
  allAwards.unshift(12);
  allAwards.push(30);
  allAwards.push(31);

  const awards = [];
  const achievements = [];
  for (let i = 0; i < 5; i++) {
    awards.push(allAwards.getnkill());
    achievements.push(allAchievements.getnkill());
  }
  return { awards, achievements };
}

function getTilePos(index) {
  let row;
  let width;
  let rowPos;

  rowPos = index + 1;
  row = 0;
  while (row < 10) {
    width = 9 - Math.abs(row - 4);
    if (rowPos <= width) {
      rowPos--;
      break;
    }
    rowPos -= width;
    row++;
  }

  return {
    row,
    rowPos,
    x: 686 + 136 * rowPos - 68 * (4 - (Math.abs(4 - row))),
    y: 313.5 + 118 * row
  };
}

function genRandBoard() {

  const { awards, achievements } = genRandAwAch();

  let allTiles = Array.from({ length: 61 }, (x, i) => i);
  const resources = Array.from({ length: 61 }, (x, i) => []);

function getRandomResource() {
  const statisticWeights = [
    5, //card
    11, //steel
    45, //leave
    4, //titan
    9, //heat
  ]
  let rnd = Math.floor(Math.random() * statisticWeights.reduce((a,e)=>a+e));
  let resourceIndex;
  let sum = 0;
  statisticWeights.forEach((e,i) => {
    if(rnd >= sum && rnd < sum + e) {
      resourceIndex = i;
    }
    sum += e;
  });
  return resourceIndex;
}

  allTiles.forEach(i => {
    if (Math.floor(Math.random() * 1.8)) {
      resources[i].push(getRandomResource());
      if (Math.floor(Math.random() * 1.3)) {
        if (Math.floor(Math.random() * 1.15)) {
          resources[i].push(getRandomResource());
        }
        else {
          resources[i].push(resources[i][0]);
          if (Math.floor(Math.random() * 1.05)) {
            resources[i].push(resources[i][0]);
          }
        }
      }
    }

  });

  function hasNeighbours(t, possibleNeighbourPositions) {
    let hasNeighboursBool = false;
    possibleNeighbourPositions.forEach(n => {
      const ut = t.row < n.row ? t : n;
      const lt = t.row < n.row ? n : t;

      if ((t.row === n.row && Math.abs(t.rowPos - n.rowPos) === 1) ||
        (Math.abs(t.row - n.row) === 1) && (
          (t.row+n.row <= 7 && (ut.rowPos === lt.rowPos || ut.rowPos === lt.rowPos - 1)) ||
          (t.row+n.row >= 9 && (ut.rowPos === lt.rowPos || ut.rowPos === lt.rowPos + 1)) 
          )) {
        hasNeighboursBool = true;
      }
    });
    return hasNeighboursBool;
  }

  const oceanTiles = [];
  var areasNum = 0;
  var oceanPositions = [];
  var areaLimitReached = false;
  for (let i = 0; i < 12; i++) {
    let newOcean = allTiles.getnkill();
    oceanTiles.push(newOcean);
    console.log(areasNum);
    if(areaLimitReached) {
      continue;
    }
    ({ row, rowPos } = getTilePos(newOcean));
    if(!hasNeighbours({ row, rowPos }, oceanPositions)) {
      areasNum++;
    }
    oceanPositions.push({ row, rowPos });
    if(areasNum === 5) {
      areaLimitReached = true;
      //remove tiles without neighbouring oceans from generation pool
      const neighboringTiles = [];
      allTiles.forEach(tileNum => {
        if(hasNeighbours(getTilePos(tileNum), oceanPositions)) {
          neighboringTiles.push(tileNum);
        }
      });
      allTiles = neighboringTiles;
    }
  }

  return { oceanTiles, resources };
}

$(document).ready(() => {
  const { awards, achievements } = genRandAwAch();

  $awContainer = $('#awContainer');
  $achContainer = $('#achContainer');

  $boardContainer = $('#boardContainer');

  if ($awContainer.length && $achContainer.length) {

    achievements.forEach(ach =>
      $achContainer.append(`<div class = "icon icon-${ach}"></div>`));

    awards.forEach(aw =>
      $awContainer.append(`<div class = "icon icon-${aw}"></div>`));
  }

  if ($boardContainer.length) {
    const { oceanTiles, resources } = genRandBoard();
    // console.log(oceanTiles, resources);

    var canvas = document.getElementById('boardCanvas');
    canvas.setAttribute('width', '2049');
    canvas.setAttribute('height', '1734')
    var ctx = canvas.getContext('2d');

    const loadedImgs = new Map();
    const BOARDIMGSRC = "/images/board.jpg";
    const OCNIMGSRC = "/images/oceanTile.png";
    const RESIMGSRC = "/images/resSprite.png";
    const AWACHIMGSRC = "/images/awAchSprite.png";

    [BOARDIMGSRC, OCNIMGSRC, RESIMGSRC, AWACHIMGSRC].forEach((imgsrc, i, arr) => {
      let img = new Image();
      img.addEventListener('load', function () {
        onImgLoad(img, imgsrc, arr.length);
      }, false);
      img.src = imgsrc;
    });

    function onImgLoad(img, index, imgNum) {
      loadedImgs.set(index, img);
      if (loadedImgs.size !== imgNum) {
        return;
      }
      ctx.drawImage(loadedImgs.get(BOARDIMGSRC), 0, 0);
      ctx.globalAlpha = 1;
      let row;
      let width;
      let rowPos;

      oceanTiles.forEach(i => {
        ({ x, y } = getTilePos(i));
        ctx.drawImage(loadedImgs.get(OCNIMGSRC), x, y);
      });

      resources.forEach((res, i) => {
        if (!res.length) {
          return;
        }

        ({ x, y } = getTilePos(i));
        switch (res.length) {
          case 1:
            ctx.drawImage(loadedImgs.get(RESIMGSRC),
              res[0] * 53, 0, 53, 67,
              x + 50, y + 25, 26, 33);
            break;
          case 2:
          ctx.drawImage(loadedImgs.get(RESIMGSRC),
          res[0] * 53, 0, 53, 67,
          x + 50, y + 25, 26, 33);
          ctx.drawImage(loadedImgs.get(RESIMGSRC),
          res[1] * 53, 0, 53, 67,
          x + 25, y + 50, 26, 33);
            break;
          case 3:
          ctx.drawImage(loadedImgs.get(RESIMGSRC),
          res[0] * 53, 0, 53, 67,
          x + 25, y + 50, 26, 33);
          ctx.drawImage(loadedImgs.get(RESIMGSRC),
          res[1] * 53, 0, 53, 67,
          x + 55, y + 50, 26, 33);
          ctx.drawImage(loadedImgs.get(RESIMGSRC),
          res[2] * 53, 0, 53, 67,
          x + 85, y + 50, 26, 33);
            break;
        }

      });
      
      awards.forEach((i, ind) => {
        ctx.drawImage(loadedImgs.get(AWACHIMGSRC),
        40.5 + (i % 4)*289, 28 + Math.floor(i / 4)*168.75, 289, 168.75,
          ind*179  + 119, 1545, 169, 99);
      });

      achievements.forEach((i, ind) => {
        ctx.drawImage(loadedImgs.get(AWACHIMGSRC),
        40.5 + (i % 4)*289, 28 + Math.floor(i / 4)*168.75, 289, 168.75,
          ind*176  + 1049, 1537, 176, 104);
      });

    }
  }
});