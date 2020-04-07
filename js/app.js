"use strict";

(function () {
  let initialNumberOfShots = 10;
  let numberOfShots = localStorage.getItem("numberOfShots") || initialNumberOfShots;
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
    render: { fillStyle: "#084678" },
  };
  let ballRadius = 30;
  let ballStyle = { fillStyle: "#ee6208" };
  let basketThickness = 20;
  let basketWidth = ballRadius * 2 + 20;
  let basketStyle = { fillStyle: "#222" };
  let basketTopMargin = ballRadius * 2 + 50;
  let basketBottomMargin = bodyHeight - shotCenter.y + ballRadius + 50;
  let basketNetStyle = { fillStyle: "#222" };
  let basketNetThickness = 2;

  let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Events = Matter.Events,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

  let engine = Engine.create();
  let world = engine.world;

  let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: bodyWidth,
      height: bodyHeight,
      pixelRatio: window.devicePixelRatio,
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

    World.clear(engine.world);
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
      bodyHeight + wallThickness / 2,
      bodyWidth,
      wallThickness,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    let ball = Bodies.circle(shotCenter.x, shotCenter.y, ballRadius, {
      isStatic: true,
      restitution: 1,
      render: ballStyle,
    });
    // one of the 2 circles used to capture collision
    let basketLeftCircle = Bodies.circle(
      generateRandomFloat(
        basketThickness / 2 + wallThickness,
        bodyWidth - basketThickness - wallThickness - basketWidth
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
    let basketNet1 = Bodies.rectangle(
      (basketRightCircle.parts[0].position.x +
        basketLeftCircle.parts[0].position.x) /
        2,
      basketLeftCircle.parts[0].position.y + basketThickness + 2,
      basketWidth,
      basketNetThickness,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );
    let basketNet2 = Bodies.rectangle(
      (basketRightCircle.parts[0].position.x +
        basketLeftCircle.parts[0].position.x) /
        2,
      basketLeftCircle.parts[0].position.y + basketThickness + 17,
      basketWidth,
      basketNetThickness,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );
    let basketNet3 = Bodies.rectangle(
      basketLeftCircle.parts[0].position.x,
      basketLeftCircle.parts[0].position.y + 25,
      basketNetThickness,
      50,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );
    let basketNet4 = Bodies.rectangle(
      basketLeftCircle.parts[0].position.x + 20,
      basketLeftCircle.parts[0].position.y + 25,
      basketNetThickness,
      50,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );
    let basketNet5 = Bodies.rectangle(
      basketLeftCircle.parts[0].position.x + 40,
      basketLeftCircle.parts[0].position.y + 25,
      basketNetThickness,
      50,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );
    let basketNet6 = Bodies.rectangle(
      basketLeftCircle.parts[0].position.x + 60,
      basketLeftCircle.parts[0].position.y + 25,
      basketNetThickness,
      50,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );
    let basketNet7 = Bodies.rectangle(
      basketLeftCircle.parts[0].position.x + 80,
      basketLeftCircle.parts[0].position.y + 25,
      basketNetThickness,
      50,
      { isStatic: true, isSensor: true, render: basketNetStyle }
    );

    World.add(world, [
      ceil,
      leftWall,
      rightWall,
      floor,
      ball,
      basketLeftCircle,
      basketRightCircle,
      basketBar,
      basketNet1,
      basketNet2,
      basketNet3,
      basketNet4,
      basketNet5,
      basketNet6,
      basketNet7,
    ]);

    document.addEventListener("click", function (e) {
      if (calculateDistance(shotCenter, e) > 100 || !isOut) {
        console.log("Can't shoot right now!");
        return;
      }
      // shoot
      Body.setStatic(ball, false);
      let forceMagnitude = 0.02 * ball.mass;
      Body.applyForce(ball, ball.position, {
        x: ((shotCenter.x - e.x) / 10) * forceMagnitude,
        y: ((shotCenter.y - e.y) / 10) * forceMagnitude,
      });
      isOut = false;
      shotsCounter++;
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
            goalElement.style.left =
              (bodyWidth - goalElement.offsetWidth) / 2 + "px";
            goalElement.style.top =
              (bodyHeight - goalElement.offsetWidth) / 2 + "px";
            isCelebrating = true;
            setTimeout(function () {
              goalElement.classList.add("hidden");
              initialize();
              isOnTopOfBasket = false;
              isCelebrating = false;
            }, 2000);
          }
        } else if (hitFloor) {
          console.log("Out!");
          isOut = true;
          if (!isCelebrating) {
            numberOfShots--;
          }
          if (numberOfShots > 0) {
            if (!isCelebrating) {
              Body.setStatic(ball, true);
              Body.setPosition(ball, shotCenter);
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
        updateMenuFields();
      }
    });

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
