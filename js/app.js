"use strict";

let bodyWidth = document.body.clientWidth;
let bodyHeight = document.body.clientHeight;
let shotCenter = {
  x: bodyWidth / 2,
  y: bodyHeight - 100,
};
let wallThickness = 10;
let wallStyle = { fillStyle: "#000" };
let ballRadius = 30;
let ballStyle = { fillStyle: "#e3701c" };
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

let isOnTopOfBasket = false;
let numberOfBalls = 5;

World.add(world, [
  Bodies.rectangle(bodyWidth / 2, wallThickness / 2, bodyWidth, wallThickness, {
    isStatic: true,
    render: wallStyle,
  }),
  Bodies.rectangle(wallThickness / 2, bodyHeight / 2, wallThickness, bodyHeight, {
    isStatic: true,
    render: wallStyle,
  }),
  Bodies.rectangle(bodyWidth - wallThickness / 2, bodyHeight / 2, wallThickness, bodyHeight, {
    isStatic: true,
    render: wallStyle,
  }),
]);

let floor = Bodies.rectangle(bodyWidth / 2, bodyHeight + wallThickness / 2, bodyWidth, wallThickness, {
  isStatic: true,
  render: wallStyle,
  isSensor: true,
});
let ball = Bodies.circle(shotCenter.x, shotCenter.y, ballRadius, {
  isStatic: true,
  restitution: 1,
  render: ballStyle,
});
let basket
let basketLeftCircle = Bodies.circle(
  random(basketThickness / 2 + wallThickness, bodyWidth - basketThickness - wallThickness - basketWidth),
  random(basketThickness / 2 + wallThickness + basketTopMargin, bodyHeight - basketThickness - basketBottomMargin),
  basketThickness / 2,
  { isStatic: true, render: basketStyle }
);
let basketRightCircle = Bodies.circle(
  basketLeftCircle.parts[0].position.x + basketWidth,
  basketLeftCircle.parts[0].position.y,
  basketThickness / 2,
  { isStatic: true, render: basketStyle }
);
let basketLine = Bodies.rectangle(
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

World.add(world, [ball, basketLeftCircle, basketRightCircle, basketLine, basketNet1, basketNet2, basketNet3, basketNet4, basketNet5, basketNet6, basketNet7, floor]);

document.addEventListener("click", function (e) {
  if (Math.sqrt((shotCenter.x - e.x) ** 2 + (shotCenter.y - e.y) ** 2) > 100) {
    return;
  }
  Body.setStatic(ball, false);
  let forceMagnitude = 0.02 * ball.mass;
  Body.applyForce(ball, ball.position, {
    x: ((shotCenter.x - e.x) / 10) * forceMagnitude,
    y: ((shotCenter.y - e.y) / 10) * forceMagnitude,
  });
});

Events.on(engine, "collisionStart", function (event) {
  var pairs = event.pairs;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    if (
      (pair.bodyA === ball && pair.bodyB === basketLine) ||
      (pair.bodyB === ball && pair.bodyA === basketLine)
    ) {
      console.log("Collision started!");
      if (ball.parts[0].position.y < basketLine.parts[0].position.y) {
        isOnTopOfBasket = true;
      }
    }
  }
});

Events.on(engine, "collisionEnd", function (event) {
  var pairs = event.pairs;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    if (
      (pair.bodyA === ball && pair.bodyB === basketLine) ||
      (pair.bodyB === ball && pair.bodyA === basketLine)
    ) {
      if (
        isOnTopOfBasket &&
        ball.parts[0].position.y > basketLine.parts[0].position.y
      ) {
        console.log("Goal!");
        isOnTopOfBasket = false;
      }
    } else if (
      (pair.bodyA === ball && pair.bodyB === floor) ||
      (pair.bodyB === ball && pair.bodyA === floor)
    ) {
      console.log("out!");
      numberOfBalls--;
      if (numberOfBalls > 0) {
        Body.setStatic(ball, true);
        Body.setPosition(ball, shotCenter);
        console.log("reset");
      }
    }
  }
});

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: bodyWidth, y: bodyHeight },
});


function random(min, max) {
  return Math.random() * (max - min) + min;
}