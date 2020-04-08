"use strict";

(function () {
  let initialNumberOfShots = 10;
  let numberOfShots =
    localStorage.getItem("numberOfShots") || initialNumberOfShots;
  let level = localStorage.getItem("level") || 1;
  let maxLevel = localStorage.getItem("maxLevel") || 1;
  let isCelebrating = false;

  let backgroundBallElement = document.querySelector(".background-ball");
  let menuElement = document.querySelector(".menu");
  let levelElements = document.querySelectorAll(".level");
  let shotsElements = document.querySelectorAll(".shots");
  let hintsElement = document.querySelector(".hint");
  let goalElement = document.querySelector(".goal");
  let playButton = document.querySelector(".play");
  playButton.addEventListener("click", function (e) {
    e.stopPropagation();
    initialize();
    hideMenu();
    dropDownBackgroundBall();
  });

  let hints = ["Goal the first shot to get 5 more.", "Shoot walls."];

  let bodyWidth = document.body.clientWidth;
  let bodyHeight = document.body.clientHeight;
  let shotCenter = {
    x: bodyWidth / 2,
    y: bodyHeight - 100,
  };
  let wallThickness = 10;
  let wallOptions = {
    isStatic: true,
    render: { fillStyle: "#777" },
  };
  let basketToBallRatio = 1.8848;
  let ballRadius = 30;
  let ballStyle = { fillStyle: "#ec4405" };
  let basketThickness = 15;
  let basketWidth = ballRadius * basketToBallRatio * 2;
  let basketStyle = { fillStyle: "#222" };
  let basketTopMargin = ballRadius * 2 + 50;
  let basketBottomMargin = bodyHeight - shotCenter.y + ballRadius + 50;
  let basketNetThickness = 2;
  let basketNetHeight = 50;

  let Engine = Matter.Engine;
  let Render = Matter.Render;
  let Runner = Matter.Runner;
  let Body = Matter.Body;
  let Events = Matter.Events;
  let Composite = Matter.Composite;
  let Composites = Matter.Composites;
  let Common = Matter.Common;
  let Constraint = Matter.Constraint;
  let MouseConstraint = Matter.MouseConstraint;
  let Mouse = Matter.Mouse;
  let World = Matter.World;
  let Bodies = Matter.Bodies;

  let engine = Engine.create();
  let world = engine.world;

  let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: bodyWidth,
      height: bodyHeight,
      pixelRatio: "auto",
      background: "white",
      wireframes: false,
    },
  });
  Render.run(render);

  let runner = Runner.create();
  Runner.run(runner, engine);

  function initialize() {
    let isOnTopOfBasket = false;
    let isOut = true;
    let shotsCounter = 0;

    World.clear(world);
    Engine.clear(engine);

    let ceil = Bodies.rectangle(
      bodyWidth / 2,
      wallThickness / 2,
      bodyWidth,
      wallThickness,
      wallOptions
    );
    let leftWall = Bodies.rectangle(
      bodyWidth - wallThickness / 2,
      bodyHeight / 2,
      wallThickness,
      bodyHeight,
      wallOptions
    );
    let rightWall = Bodies.rectangle(
      wallThickness / 2,
      bodyHeight / 2,
      wallThickness,
      bodyHeight,
      wallOptions
    );
    let floor = Bodies.rectangle(
      bodyWidth / 2,
      bodyHeight + wallThickness / 2 + ballRadius * 2,
      bodyWidth,
      wallThickness,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    let ball = Bodies.circle(shotCenter.x, shotCenter.y, ballRadius, {
      restitution: 1,
      render: ballStyle,
      density: 0.004,
    });
    let elastic = Constraint.create({
      pointA: shotCenter,
      bodyB: ball,
      stiffness: 0.08,
      render: {
        anchors: false,
        type: "line",
        strokeStyle: "orange",
      },
    });
    // one of the 2 circles used to capture collision
    let basketLeftCircle = Bodies.circle(
      generateRandomFloat(
        basketThickness / 2 + wallThickness,
        bodyWidth - basketWidth - wallThickness - basketThickness / 2
      ),
      generateRandomFloat(
        basketThickness / 2 + wallThickness + basketTopMargin,
        bodyHeight - basketThickness - basketBottomMargin
      ),
      basketThickness / 2,
      { isStatic: true, render: basketStyle }
    );
    // one of the 2 circles used to capture collision
    let basketRightCircle = Bodies.circle(
      basketLeftCircle.parts[0].position.x + basketWidth,
      basketLeftCircle.parts[0].position.y,
      basketThickness / 2,
      { isStatic: true, render: basketStyle }
    );
    let basketBar = Bodies.rectangle(
      (basketRightCircle.parts[0].position.x +
        basketLeftCircle.parts[0].position.x) /
        2,
      basketLeftCircle.parts[0].position.y,
      basketWidth,
      basketThickness,
      { isStatic: true, isSensor: true, render: basketStyle }
    );
    let basketNetVerticalLines = Composites.stack(
      basketLeftCircle.position.x - basketNetThickness / 2,
      basketLeftCircle.position.y,
      7,
      1,
      basketWidth / 6 - basketNetThickness,
      0,
      function (x, y) {
        return Bodies.rectangle(x, y, basketNetThickness, basketNetHeight + 20, { isStatic: true, isSensor: true, });
      }
    );
    let basketNetHorizonralLines = Composites.stack(
      basketLeftCircle.position.x,
      basketLeftCircle.position.y + 5,
      1,
      4,
      0,
      basketNetHeight / 3 - basketNetThickness,
      function (x, y) {
        return Bodies.rectangle(x, y, basketWidth, basketNetThickness, { isStatic: true, isSensor: true, });
      }
    );

    World.add(world, [
      ceil,
      leftWall,
      rightWall,
      floor,
      ball,
      elastic,
      basketLeftCircle,
      basketRightCircle,
      basketBar,
      basketNetVerticalLines,
      basketNetHorizonralLines,
    ]);

    let numberOfObstacles = Math.min(Math.floor(level / 1), 10);
    let obstacleMaxWidth = Math.min(bodyWidth / 20, 200);
    let obstacleMaxHeight = Math.min(bodyHeight / 20, 200);
    for (let i = 0; i < numberOfObstacles; i++) {
      let obstacle = Bodies.rectangle(
        generateRandomFloat(
          wallThickness,
          bodyWidth
        ),
        generateRandomFloat(
          wallThickness,
          bodyHeight
        ),
        generateRandomFloat(50, obstacleMaxWidth),
        generateRandomFloat(50, obstacleMaxHeight),
        { isStatic: true, render: { fillStyle: "#777" } }
      );
      World.add(world, obstacle);
    }


    let isStuckInterval;

    Events.on(engine, "afterUpdate", function () {
      let isShot =
        mouseConstraint.mouse.button === -1 &&
        calculateDistance(ball.position, shotCenter) > 10;
      if (isShot) {
        elastic.render.visible = false;
        elastic.bodyB = null;
      }
    });

    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });
    World.add(world, mouseConstraint);
    render.mouse = mouse;

    Events.on(mouseConstraint, "mousedown", function (e) {
      console.log(ball, e);
    });

    Events.on(engine, "collisionStart", function (event) {
      let pairs = event.pairs;
      for (let i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];
        let hitBasketBar =
          (pair.bodyA === ball && pair.bodyB === basketBar) ||
          (pair.bodyB === ball && pair.bodyA === basketBar);
        if (hitBasketBar) {
          if (ball.parts[0].position.y < basketBar.parts[0].position.y) {
            console.log("Collision started!");
            isOnTopOfBasket = true;
          }
        }
      }
    });

    Events.on(engine, "collisionEnd", function (event) {
      let pairs = event.pairs;
      for (let i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];
        let hitBasketBar =
          (pair.bodyA === ball && pair.bodyB === basketBar) ||
          (pair.bodyB === ball && pair.bodyA === basketBar);
        let hitFloor =
          (pair.bodyA === ball && pair.bodyB === floor) ||
          (pair.bodyB === ball && pair.bodyA === floor);
        if (hitBasketBar) {
          let isGoal =
            isOnTopOfBasket &&
            ball.parts[0].position.y > basketBar.parts[0].position.y;
          if (isGoal) {
            setGoal();
          }
          isOnTopOfBasket = false;
        } else if (hitFloor && elastic.bodyB === null) {
          setOut();
        }
        updateMenuFields();
      }
    });

    function setGoal() {
      console.log("Goal!");
      if (shotsCounter === 1) {
        numberOfShots += 5;
      } else {
        numberOfShots += 1;
      }
      level++;
      if (level > maxLevel) {
        maxLevel = level;
      }
      goalElement.classList.remove("hidden");
      goalElement.style.left = (bodyWidth - goalElement.offsetWidth) / 2 + "px";
      goalElement.style.top = (bodyHeight - goalElement.offsetWidth) / 2 + "px";
      isCelebrating = true;
      setTimeout(function () {
        goalElement.classList.add("hidden");
        initialize();
        isCelebrating = false;
      }, 2000);
    }

    function setOut() {
      console.log("Out!");
      clearInterval(isStuckInterval);
      isOut = true;
      if (!isCelebrating) {
        numberOfShots--;
      }
      if (numberOfShots > 0) {
        if (!isCelebrating && elastic.bodyB === null) {
          Body.setStatic(ball, true);
          Body.setStatic(ball, false);
          Body.setPosition(ball, shotCenter);
          elastic.bodyB = ball;
          elastic.render.visible = true;
        }
      } else {
        backgroundBallElement.style.left = ball.parts[0].position.x + "px";
        backgroundBallElement.style.top = ball.parts[0].position.y + "px";
        document.removeEventListener("click", function () {});
        level = 1;
        numberOfShots = initialNumberOfShots;
        showMenu();
      }
    }

    // fit the render viewport to the scene
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: bodyWidth, y: bodyHeight },
    });
  }

  function showMenu() {
    save();
    bringUpBackgroundBall();
    updateMenuFields();
    setTimeout(function () {
      menuElement.classList.remove("fade");
    }, 400);
  }

  function hideMenu() {
    menuElement.classList.add("fade");
    for (let levelElement of levelElements) {
      levelElement.classList.remove("hidden");
    }
    for (let shotElement of shotsElements) {
      shotElement.classList.remove("hidden");
    }
  }

  function save() {
    localStorage.setItem("level", level);
    localStorage.setItem("maxLevel", maxLevel);
    localStorage.setItem("numberOfShots", numberOfShots);
  }

  function bringUpBackgroundBall() {
    backgroundBallElement.classList.remove("hidden");
    setTimeout(function () {
      let backgroundBallRadius =
        Math.sqrt(bodyWidth ** 2 + bodyHeight ** 2) + 10;
      backgroundBallElement.style.width = backgroundBallRadius + "px";
      backgroundBallElement.style.height = backgroundBallRadius + "px";
      backgroundBallElement.style.top =
        -((backgroundBallRadius - bodyHeight) / 2) + "px";
      backgroundBallElement.style.left =
        -((backgroundBallRadius - bodyWidth) / 2) + "px";
    }, 100);
  }

  function dropDownBackgroundBall() {
    backgroundBallElement.style.width = ballRadius * 2 + "px";
    backgroundBallElement.style.height = ballRadius * 2 + "px";
    backgroundBallElement.style.top = shotCenter.y - ballRadius + "px";
    backgroundBallElement.style.left = shotCenter.x - ballRadius + "px";
    setTimeout(function () {
      backgroundBallElement.classList.add("hidden");
    }, 500);
  }

  function updateMenuFields() {
    for (let levelElement of levelElements) {
      levelElement.textContent = "Level: " + level;
    }
    for (let shotElement of shotsElements) {
      shotElement.textContent = "Shots: " + numberOfShots;
    }
    hintsElement.textContent =
      "Hint: " + hints[Math.floor(generateRandomInteger(0, hints.length - 1))];
  }

  function generateRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  function generateRandomInteger(min, max) {
    return Math.floor(generateRandomFloat(min, max + 1));
  }

  function calculateDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
  }

  showMenu();
})();
