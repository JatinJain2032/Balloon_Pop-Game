import "./style.css";
import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // Set to full screen width
  height: window.innerHeight, // Set to full screen height
  backgroundColor: "#ffffff", // Set the background color to white
  physics: {
    default: "arcade", // Enable arcade physics for floating effect
    arcade: {
      gravity: { y: 0 }, // Disable gravity so the balloon floats smoothly
      debug: false, // Disable physics debugging
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
var isPumping = false; // To avoid multiple presses during the pump action
var pumpCounter = 0; // Counter to track pump presses
var balloonIsFloating = false; // Boolean to check if balloon is floating
var moveLeft = false; // Flag to indicate the balloon should move left
var balloonG, letterA; // Declare balloon and letter globally

function preload() {
  this.load.image("balloonG", "assets/balloonG.png");
  this.load.image("balloonBurst", "assets/balloonBurst.png"); 
  this.load.image("pump", "assets/pump.png");
  this.load.image("bg", "assets/bg.png");
  this.load.image("machine", "assets/machine.png");
  this.load.image("letterA", "assets/A.png");
  this.load.image("outlet", "assets/outlet.png");

}

function create() {
  // Add the background image and set it to full screen
  var background = this.add.image(0, 0, "bg").setOrigin(0, 0);
  background.setDisplaySize(
    this.sys.game.config.width,
    this.sys.game.config.height
  );

  // Create the balloon with physics enabled
  balloonG = this.physics.add.image(1130, 390, "balloonG");
  balloonG.setScale(0.3); // Set initial scale
  balloonG.setCollideWorldBounds(true); // Prevent the balloon from going out of bounds

  // Create the letter inside the balloon
  letterA = this.add.image(balloonG.x, balloonG.y, "letterA");
  letterA.setDisplaySize(50, 50); // Resize letter to fit inside balloon

  var machine = this.add.image(1380, 570, "machine");
  machine.setScale(0.7);

  var outletX = machine.x - (machine.displayWidth * machine.scaleX) / 2 - 55;
  var outletY = machine.y - 30;
  var outlet = this.add.image(outletX, outletY, "outlet");
  outlet.setScale(0.5);

  var pump = this.add.image(machine.x, machine.y - 200, "pump");
  pump.setScale(0.5);

  var pumpOriginalY = pump.y; // Save the pump's original position

  // Make the pump interactive
  pump.setInteractive();

  // Add event listener for pointerdown on the pump
  pump.on(
    "pointerdown",
    function () {
      // Check if the pump is already being pressed
      if (isPumping || balloonIsFloating) return; // Prevent pressing if balloon is floating

      isPumping = true; // Set flag to true to prevent multiple presses

      // Move the pump down to simulate pressing
      pump.y += 20;

      // Inflate the balloon slightly
      if (balloonG.scaleX < 0.8) {
        // Limit balloon size to 0.8
        balloonG.setScale(balloonG.scaleX + 0.05);
        console.log("Pump pressed! Balloon scaled to: " + balloonG.scaleX);
      }

      // Use a timed event to reset the pump position after 0.2 seconds
      this.time.delayedCall(
        200,
        function () {
          pump.y = pumpOriginalY; // Move the pump back up
          isPumping = false; // Reset flag to allow pressing again
        },
        [],
        this
      ); // Pass the current scene as context for delayedCall

      // Increment pump press counter
      pumpCounter++;
      console.log("Pump Counter: " + pumpCounter);

      // After 3 presses, make the balloon float
      if (pumpCounter === 3) {
        balloonIsFloating = true; // Set flag to indicate balloon is floating
      }
    },
    this
  ); // Pass the current scene as context for the event

  // Make the balloon interactive (for popping)
  balloonG.setInteractive();
  balloonG.on("pointerdown", function () {
    if (balloonG.texture.key !== "balloonBurst") {
      balloonG.setTexture("balloonBurst");
      letterA.setVisible(false); // Hide the letter after bursting
      console.log("Balloon burst!");
    }
  });
}

function update() {
  // If the balloon is floating
  if (balloonIsFloating) {
    if (!moveLeft) {
      // Phase 1: Balloon floats up until it reaches a certain Y position
      balloonG.setVelocityY(-50); // Make the balloon float up slowly

      // When the balloon reaches a Y position of 150, switch to moving left
      if (balloonG.y <= 150) {
        balloonG.setVelocityY(0); // Stop moving upwards
        moveLeft = true; // Set flag to move left
      }
    } else {
      // Phase 2: Balloon moves left across the screen
      balloonG.setVelocityX(-100); // Move left
    }

    // Move the letter along with the balloon
    letterA.x = balloonG.x;
    letterA.y = balloonG.y;
  }
}
