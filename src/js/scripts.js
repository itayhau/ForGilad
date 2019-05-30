// piece object
const piece = (function() {

  let el = null;
  let radius = null;
  let busy = false;

  const init = function(el) {
    this.el = el;
    const $style = window.getComputedStyle(el);
    this.radius = parseInt($style.getPropertyValue('border-radius'));  

    setCircleColorByTemperature(el);
  };

  const setCircleColorByTemperature = function(el) {
    this.temperature = 0;
    this.color = 'blue';

    fetch('http://api.apixu.com/v1/current.json?key=dda6e762ae4f41efb7e173552192204&q=tel%20aviv')
    .then((response) => {
      return response.json();
    })
    .then((result)  => {
      this.temperature = result.current.temp_c;
      if (this.temperature >= 11 && this.temperature <= 20) {
        this.color = 'green';
      } 
      else if (this.temperature >= 21 && this.temperature <= 30) {
        this.color = 'yellow';
      } 
      else if (this.temperature > 30) {
        this.color = 'red';
      }
  
      el.style.background = this.color;
      el.style.borderColor = this.color;
  
      el.addEventListener("mouseover", ( event ) => {   
        el.style.background = 'white'; });
      
      el.addEventListener("mouseout", ( event ) => {   
        el.style.background = this.color; });
        
    }).catch((error) => {
      console.log(`error: ${error}`);
    });
  }
  

  const moveDelta = function(dx, dy) {
    const pos = this.el.getBoundingClientRect();
    const $viewerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const $viewerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    if (pos.left + dx + this.radius * 2 > $viewerWidth || pos.top + dy + this.radius * 2 > $viewerHeight ||
        pos.left + dx < 0 || pos.top + dy < 0) {
      return;
    }
    
    // ---- without animation
    //this.el.style.left = `${pos.left + dx}px`;
    //this.el.style.top = `${pos.top + dy}px`;

    // ----- with animation
    if (!this.busy) {
      this.busy = true;
      const toX = pos.left + dx;
      const toY = pos.top + dy;
      const smalldX = dx != 0 ? (dx / Math.abs(dx)) : 0
      const smalldY = dy != 0 ? (dy / Math.abs(dy)) : 0
      const id = setInterval( () => {
        const pos = this.el.getBoundingClientRect();
        if (pos.left == toX && pos.top == toY) {
          clearInterval(id);
          this.busy = false;
        } else {
          this.el.style.left = `${pos.left + smalldX}px`;
          this.el.style.top = `${pos.top + smalldY}px`;
        }
        }, 10);
    }

  };
  const resetPosition = function() {
    const pos = this.el.getBoundingClientRect();

    // alternatively to the null solution, you can keep the starting position here as fields
    // and OnReset - restore the original values
    // but then... it will be duplicated- here, and also in the css file
    this.el.style.left = null; 
    this.el.style.top = null;
  };
  const setRandomPosition = function() {
    const $viewerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const $viewerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this.el.style.left = `${Math.floor(Math.random() * ($viewerWidth - this.radius * 2))}px`;
    this.el.style.top = `${Math.floor(Math.random() * ($viewerHeight - this.radius * 2))}px`;
  };
  return {
    init,
    moveDelta,
    resetPosition,
    setRandomPosition,
  };
})();

function handleClick(ev) {
  piece.moveDelta(parseInt(this.dataset.dx), parseInt(this.dataset.dy));
}

function initBtn( { btnName, dx, dy } ) {
  const $btn = document.getElementById(btnName);
  $btn.dataset.dx = dx;
  $btn.dataset.dy = dy;  
  $btn.addEventListener("click", handleClick);
}

function handleResetClick(ev) {
  piece.resetPosition();
}

function handleRandomClick(ev) {
  piece.setRandomPosition();
}

function init() {
  const $startValues = [ { btnName: "btn-up", dx: 0, dy: -100}, { btnName: "btn-right", dx: 100, dy: 0}, 
                         { btnName: "btn-down", dx: 0, dy: 100}, { btnName: "btn-left", dx: -100, dy: 0}];
  $startValues.forEach( initValues => initBtn (  initValues ) );

  document.getElementById("btn-reset").addEventListener("click", handleResetClick);

  document.getElementById("btn-random").addEventListener("click", handleRandomClick);
}

window.addEventListener("DOMContentLoaded", event => {
  piece.init(document.getElementById("piece"));
  init();
 
});
