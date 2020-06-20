// Получаем блок и поле ввода, для дальнейшей работы с ним
var divName = document.getElementById('divName');
var inpName = document.getElementById('inpName');

// Создаем канвас, с разрешением 1024 на 768, и объявляем функции предзагрузки, создания и обновления холста
var game = new Phaser.Game(1024, 768, Phaser.CANVAS, null, {
    preload: preload, create: create, update: update
});

// Создаем глобальные переменные, в которых будут хранится объекты игры и информация о них
var background, player, spaceKey, timerText, pits, pitInfo, newPit, tools, toolInfo, newTool, gameName, gameInstruction, gameStat, health, healthInfo, playerName, time;
var healthSpawn = true;
var playerSpeed = 5;
var timer = 20;
var arrayRandRow = [];
var tempHealth = 0;
var scoreText, toolsText, endText, power, powerText, plusText, minusText;
var powerTimer = 7;
var powerOnce = false;
var powerActive = false;
var score = 0;
var toolsCounter = 0;
var lives = 2;
var livesText;
var textSize = 40;
var textStyle = { font: textSize+'px Courier, monospace', fill: '#fff' };
var scoreTable = 'Таблица рекордов:\n';
var playing = false;
var tester = false;
var startButton, pauseButton, plusButton, minusButton, soundButton, soundOn, soundOff;
var sounds, drive, pit_fix, hit, stop, toolSound, heart, timeSound, powerSound;
var px, py;

// Функция предзагрузки канваса и файлов
function preload() {
    // Масштабируем игру
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    // Загружаем необходимые файлы

    game.load.spritesheet('button', 'img2/button.png', 120, 40);

    game.load.image('bg', 'img/bg-game.jpg');
    game.load.image('player', 'img/player.png');
    game.load.image('pit', 'img/pit2.png');
    game.load.image('tools', 'img/tools2.png');
    game.load.image('health', 'img/heart.png');
    game.load.image('power', 'img/power-skill-1.png');
    game.load.image('key_p', 'img/key/p.png');
    game.load.image('key_blank', 'img/key/blank.png');
    game.load.image('sound_on', 'img/sound.png');
    game.load.spritesheet('sound_off', 'img/sound.png', 130, 256);

    game.load.audio('drive', ['audio/drive.mp3','audio/drive.ogg']);
    game.load.audio('pit_fix', ['audio/pitfix.mp3','audio/pitfix.ogg']);
    game.load.audio('hit', ['audio/hit.mp3','audio/hit.ogg']);
    game.load.audio('stop', ['audio/stop.mp3','audio/stop.ogg']);
    game.load.audio('tool', ['audio/tools.mp3','audio/tools.ogg']);
    game.load.audio('heart', ['audio/heart.mp3','audio/heart.ogg']);
    game.load.audio('time', ['audio/time.mp3','audio/time.ogg']);
    game.load.audio('power', ['audio/power.mp3','audio/power.ogg']);
}

// Функция создания и инициализация объектов
function create() {
    // Включаем физику
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // Добавляем фон
    background = game.add.tileSprite(0, 0, 1024, 768, 'bg');
    // Создаем игрока, добавляем свойства и включаем физику
    player = game.add.sprite(game.world.width*0.5, game.world.height-160, 'player');
    player.width *= 0.75;
    player.height *= 0.75;
    player.anchor.set(0.5,0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.immovable = true;

    initPits(); // Создаем за картой ямы
    initTools(); // инструменты
    initHealth(); // и жизни

    // Добавляем на экран текст с названием игры
    gameName = game.add.text(game.world.width*0.5, 50, 'СуперАвто', textStyle);
    gameName.anchor.set(0.5);
    // Текст с инструкцией
    gameInstruction = game.add.text(game.world.width*0.5, 200, 'Инструкция:\nИгрок может передвигаться,\nкликая мышью слева и \nсправа от автомобиля.', textStyle);
    gameInstruction.anchor.set(0.5);
    // Кнопку старта, по нажатию который вызывается функция начала игры
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);

    // Кнопка увеличени шрифта
    plusButton = game.add.button(game.world.width-5, 170, 'key_blank', textSizePlus, this, 0, 0, 0);
    plusButton.width *= 0.5;
    plusButton.height *= 0.5;
    plusButton.anchor.set(1,0);
    plusText = game.add.text(game.world.width-5-plusButton.width*0.5, plusButton.y+plusButton.height*0.5, '+', textStyle);
    plusText.anchor.set(0.5,0.5);
    plusText.fill = '#000';
    // Кнопка уменьшения шрифта
    minusButton = game.add.button(game.world.width-5, 240, 'key_blank', textSizeMinus, this, 0, 0, 0);
    minusButton.width *= 0.5;
    minusButton.height *= 0.5;
    minusButton.anchor.set(1,0);
    minusText = game.add.text(game.world.width-5-minusButton.width*0.5, minusButton.y+minusButton.height*0.5, '-', textStyle);
    minusText.anchor.set(0.5,0.5);
    minusText.fill = '#000';

    ////////////////////////////////////////////////////////////////////////////////////////
    // Далее создаем объекты, которые не видно, пока пользователь не нажмет кнопку старта //
    ////////////////////////////////////////////////////////////////////////////////////////

    // Текст в котором будет записано имя игрока
    playerName = game.add.text(game.world.width*0.5, 5, '', textStyle);
    playerName.anchor.set(0.5, 0);
    playerName.visible = false;
    // Текст супер силы и его временем действия
    powerText = game.add.text(game.world.width*0.5, 50, 'СУПЕРСИЛА\n  00:0'+powerTimer, textStyle);
    powerText.anchor.set(0.5, 0);
    powerText.visible = false;
    // Счетчик очков
    scoreText = game.add.text(5, 5, 'Очки: 0', textStyle);
    scoreText.visible = false;
    // Счетчик инструментов
    toolsText = game.add.text(5, 50, 'Инстр.: 0', textStyle);
    toolsText.visible = false;
    // Счетчик жизней
    livesText = game.add.text(game.world.width-5, 5, 'Жизни: '+lives, textStyle);
    livesText.anchor.set(1,0);
    livesText.visible = false;
    // Вывод таймера
    timerText = game.add.text(game.world.width-5, 50, '00:'+timer, textStyle);
    timerText.anchor.set(1,0);
    timerText.visible = false;
    // Кнопка паузы
    pauseButton = game.add.button(game.world.width-5, 100, 'key_p', pauseGame, this, 0, 0, 0);
    pauseButton.width *= 0.5;
    pauseButton.height *= 0.5;
    pauseButton.anchor.set(1,0);
    pauseButton.visible = false;
    // Кнопка выкл звука
    soundButton = game.add.button(game.world.width-5, 310, 'key_blank', soundGame, this, 0, 0, 0);
    soundButton.width *= 0.5;
    soundButton.height *= 0.5;
    soundButton.anchor.set(1,0);
    // soundButton.visible = false;
    soundOff = game.add.sprite(game.world.width-5-soundButton.width*0.5, soundButton.y+soundButton.height*0.5, 'sound_off');
    soundOff.width *= 0.15;
    soundOff.height *= 0.15;
    soundOff.anchor.set(0.5,0.5);
    soundOff.visible = false;
    // soundOff.fill = '#000';
    soundOn = game.add.sprite(game.world.width-5-soundButton.width*0.5, soundButton.y+soundButton.height*0.5, 'sound_on');
    soundOn.width *= 0.15;
    soundOn.height *= 0.15;
    soundOn.anchor.set(0.5,0.5);
    // soundOff.fill = '#000';
    // Иконка супер силы
    power = game.add.sprite(game.world.width-5, game.world.height-5, 'power');
    power.width *= 0.075;
    power.height *= 0.075;
    power.anchor.set(1,1);
    power.visible = false;

    ///////////////////////////////////////////
    // Создаем объекты для экрана конца игры //
    ///////////////////////////////////////////

    // Текст конец игры
    endText = game.add.text(game.world.width*0.5, 50, 'Конец игры', textStyle);
    endText.anchor.set(0.5);
    endText.visible = false;
    // Таблица рекордов
    gameStat = game.add.text(game.world.width*0.5, 125, scoreTable, textStyle);
    gameStat.anchor.set(0.5, 0);
    gameStat.visible = false;

    ////////////////////////////////////
    // Далее идут технические объекты //
    ////////////////////////////////////

    // Создаем внутриигровой таймер
    time = game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);

    // Добавляем клавишу пробел, которая будет отслеживаться во время игры
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Создаем логику кнопки паузы, так как нельзя будет отследить нажатие кнопки вне игры
    game.input.keyboard.onUpCallback = function(e){
        if(e.keyCode == Phaser.Keyboard.P && playing) {
            pauseKeyGame();
        }
    };
    game.input.onDown.add(unpauseGame, self);

    // Позиция размера игрока, чтобы анимации не конфликтовали
    px = player.scale.x;
    py = player.scale.y;

    // Добавляем все звуки
    drive = game.add.audio('drive');
    pit_fix =  game.add.audio('pit_fix');
    hit = game.add.audio('hit');
    stop = game.add.audio('stop');
    toolSound = game.add.audio('tool');
    heart = game.add.audio('heart');
    timeSound = game.add.audio('time');
    powerSound = game.add.audio('power');
    // Объеденяем в массив
    sounds = [drive, pit_fix, hit, stop, toolSound, heart, timeSound, powerSound];
    // Говорим движку, что нужно дождаться загрузки файлов звука, после чего он может рисовать
    game.sound.setDecodedCallback(sounds, update, this);
    // Прописываем тайминги и громкость каждого звука
    drive.addMarker('drive_start', 17, 0, 0.2, 1);
    pit_fix.addMarker('fast_fix', 0, 0.9, 0.25);
    hit.addMarker('fast_hit', 11.3, 0.5);
    stop.addMarker('stop', 5, 2, 0.3);
    toolSound.addMarker('tool', 0, 0, 0.3);
    heart.addMarker('heart', 0.6, 0);
    timeSound.addMarker('last_time', 1, 6, 0.1);
    powerSound.addMarker('power_time', 0, 7, 0.4);
}

// Функция обновления отрисовки
function update() {
    // Меняем расположения блока ввода имени, в зависимости от расположения игры
    divName.style.margin = (game.scale.height/2 - game.scale.height/10)+"px 0 0 -90px";
    // Показываем кнопку начать игру, если поле ввода не пустое
    startButton.visible = !!inpName.value;

    // Проверяем столкновение объектов
    game.physics.arcade.collide(player, pits, pitFix);
    game.physics.arcade.collide(player, tools, toolsAdd);
    game.physics.arcade.collide(player, health, healthAdd);

    // Если статус игры playing
    if(playing) {
        // Прокручивать фон со скорость игрока
        background.tilePosition.y += playerSpeed;
        // Прокручивать ямы с фоном
        pits.y += playerSpeed;
        // Если ямы ушли вних за экран, то удалить их и создать новые
        if(pits.y > game.world.height + pitInfo.height) {
            pits.removeAll();
            initPits();
        }
        // Прокручивать инструмены с фоном
        tools.y += playerSpeed;
        // Если инструмены ушли вних за экран, то удалить их и создать новые
        if(tools.y > game.world.height + toolInfo.height - toolInfo.offset.top) {
            tools.removeAll();
            initTools();
        }

        // Если команда появления жизней активна
        if(healthSpawn) {
            // Прокручивать жизни с фоном
            health.y += playerSpeed;
            // Если жизни ушли вних за экран, то
            if (health.y > game.world.height + healthInfo.height) {
                healthSpawn = false; // отключить команду появления
                tempHealth = background.tilePosition.y; // запомнить позицию экрана
                health.kill(); // удалить объект жизни
                initHealth(); // создать новый
            }
            // данная проверку нужна для того, чтобы жизнь появлялась не так часто, как ямы и инструменты
        }
        // Если посиция экрана увеличилась на два, то активируем появление жизни
        else if(background.tilePosition.y >= (tempHealth + (game.world.height*2))) healthSpawn = true;

        // Сложные рассчеты отслеживания нажатия мышки и передвижения машины, во избежания тряски машины в стороны
        if ((game.input.x - playerSpeed*2) > player.x && game.input.activePointer.isDown && (player.x + playerSpeed) < game.world.width && game.input.y > game.world.height*0.5) {
            player.x += playerSpeed; // Изменение положение машины вправо
        }
        else if ((game.input.x + playerSpeed*2) < player.x && game.input.activePointer.isDown && (player.x - playerSpeed) > 0 && game.input.y > game.world.height*0.5) {
            player.x -= playerSpeed; // Изменение положение машины влевр
        }

        // Если игрок выехал на обочину, у него не включена супер сила и он не тестер
        if ((player.x <= 312 || player.x >= 822) && !powerActive && !tester)
        {
            endGame(); // вызывается функция конца игры
            // создается анимация экрана
            var backgroundTween = game.add.tween(background.tilePosition);
            backgroundTween.to({y:background.tilePosition.y + playerSpeed*20}, 1000, "Linear");
            // анимация игрока (в зависимости от его расположения)
            var playerTween = game.add.tween(player);
            if (player.x <= 312)
                playerTween.to({x: player.width * 0.5}, 1000, "Linear");
            else if (player.x >= 822)
                playerTween.to({x: game.world.width - player.width*0.5}, 1000, "Linear");

            // Проигрываение анимации торможения на обочине
            backgroundTween.start();
            playerTween.start();
        }

        // Если нажат пробел и до этого не нажимался
        if(spaceKey.isDown && !powerOnce) {
            powerSound.play('power_time'); // включаем звук
            power.kill(); // удаляем иконку
            powerText.visible = true; // показываем текст с обратным отсчетом
            powerOnce = true; // сообщаем, что пробел был нажат
            powerActive = true; // сообщаем, что супер сила активирована
        }
    }
}

/////////////////////////////////////////
// Теперь идут самостоятельные функции //
/////////////////////////////////////////

// Функция начала игры
function startGame() {
    drive.play('drive_start'); // включаем звук
    gameName.destroy(); // убираем название игры
    gameInstruction.destroy(); // и инструкцию
    divName.style.display = "none"; // скрываем блок с вводом имени
    startButton.destroy(); // убираем кнопку начать игру

    // Если игрок ввел кодовое слово, то активируется режим тестера и записываем другое имя
    // Иначе просто записываем имя игрока
    if(inpName.value == 'tester'){
        playerName.setText('TEST');
        tester = true;
    }
    else {
        playerName.setText(inpName.value);
    }

    // Включаем все скрыте объекты
    timerText.visible = true;
    playerName.visible = true;
    scoreText.visible = true;
    toolsText.visible = true;
    livesText.visible = true;
    power.visible = true;
    pauseButton.visible = true;

    // Активируем статус игры как playing
    playing = true;
}

// Функция смены статуса паузы игры по нажатию клавиши P
function pauseKeyGame() {
    game.paused = !game.paused;
}

// Функция паузы по нажатию кнопки на экране
function pauseGame() {
    game.paused = true;
}

// Функция возобновление игры по нажатию на любую область экрана
function unpauseGame() {
    game.paused = false;
}

// Функция вкл звука
function soundGame() {
    if(game.sound.volume > 0)
        soundGameOff();
    else soundGameOn();
}

// Функция вкл звука
function soundGameOn() {
    soundOn.visible = true;
    soundOff.visible = false;
    game.sound.volume = 1;
}

// Функция выкл звука
function soundGameOff() {
    soundOn.visible = false;
    soundOff.visible = true;
    game.sound.volume = 0;
}

// Функция увеличения значения шрифта
function textSizePlus() {
    if(textSize<200) textSize+=5;
    textSizeAll(textSize);
}

// Функция уменьшения значения шрифта
function textSizeMinus() {
    if(textSize>5) textSize-=5;
    textSizeAll(textSize);
}

// Функция изменения размера всего текста
function textSizeAll(size) {
    gameName.fontSize = size;
    gameInstruction.fontSize = size;
    playerName.fontSize = size;
    scoreText.fontSize = size;
    toolsText.fontSize = size;
    livesText.fontSize = size;
    timerText.fontSize = size;
    powerText.fontSize = size;
    endText.fontSize = size;
    gameStat.fontSize = size;
}

// Функция обновления внутриигрового таймера
function updateCounter() {
    // Если супер сила активна
    if(powerActive){
        powerTimer--; // уменьшаем значение таймера
        powerText.setText('СУПЕРСИЛА\n  00:0'+powerTimer); // выводим текст и отсчет

        var powerTween = game.add.tween(player.scale); // создаем анимацию машины
        powerTween.to({x:px*0.9,y:py*0.9}, 500, Phaser.Easing.Linear.None); // уменьшение размера
        powerTween.to({x:px,y:py}, 500, Phaser.Easing.Linear.None); // возвращение
        powerTween.start(); // запуск анимации

        // Если время силы истекло
        if(powerTimer <= 0){
            powerSound.stop(); //выключаем звук
            powerText.visible = false; // скрываем текст
            powerActive = false; // сообщаем, что супер сила не активна
        }
    }

    // Если время игры подходит к концу, то запускается звук тиканья часов
    if(timer == 6) timeSound.play('last_time');

    // Если таймер истек и игрок не тестер
    if(timer <= 0 && !tester) {
        game.time.events.remove(time); // отключаем внутриигровой таймер
        endGame(); // запускаем конец игры
        // анимация торможения
        var backgroundTween = game.add.tween(background.tilePosition);
        backgroundTween.to({y:background.tilePosition.y + playerSpeed*20}, 1000, "Linear");
        backgroundTween.start();
    }
    else if(playing) { // если статус playing
        if(!tester) timer--; // если не тестер, то уменьшать значение таймера
        playerSpeed+=0.75; // каждую секунду увеличивать скорость игрока

        // вывод таймера в формате mm:ss
        if (timer < 10) {
            timerText.setText('00:0' + timer,);
        }
        else timerText.setText('00:'+timer);
    }
}

// Функция рандомного расположения объектов на строке
function randRow() {
    for(var i=1; i <=4; i++)
    {
        arrayRandRow[i] = Math.round(Math.random() * 1.8);
    }
}

// Функция создания ям
function initPits() {
    // свойства каждой ямы
    pitInfo = {
        width: 100,
        height: 34*2,
        count: {
            row: 1,
            col: 4
        },
        offset: {
            top: -30,
            left: 350
        },
        paddingLeft: 50
    };

    randRow(); // запускаем рандом
    pits = game.add.group(); // создаем группу объектов

    // заполняем ряд ямами
    for(var c=0; c<pitInfo.count.col; c++) {
        for(var r=0; r<pitInfo.count.row; r++) {
            if (arrayRandRow[c]) {
                var pitX = (c * (pitInfo.width + pitInfo.paddingLeft)) + pitInfo.offset.left;
                var pitY = (r * pitInfo.height) + pitInfo.offset.top;
                newPit = game.add.sprite(pitX, pitY, 'pit');
                newPit.width = pitInfo.width;
                newPit.height = pitInfo.height;
                game.physics.enable(newPit, Phaser.Physics.ARCADE);
                newPit.body.immovable = true;
                newPit.anchor.set(0.5);
                pits.add(newPit);
            }
        }
    }
}

// Функция создания инструментов
function initTools() {
    // их свойства
    toolInfo = {
        width: 100,
        height: 100,
        count: {
            row: 1,
            col: 4
        },
        offset: {
            top: -(game.world.height*0.5),
            left: 350
        },
        paddingLeft: 50
    };

    randRow(); // рандом
    var toolsCount = 0;
    var toolsAddOnce = false;
    var toolsMaxInRow = Math.ceil(Math.random() *2); // максимальное количетсво инструментов в ряду (от 0 до 2)
    tools = game.add.group(); // создаем группу
    // заполняем ряд
    // при условии, что их не больше двух, они в рандомном порядке и рядом не стоят
    for (var c = 0; c < toolInfo.count.col; c++) {
        for (var r = 0; r < toolInfo.count.row; r++) {
            if (!toolsAddOnce && arrayRandRow[c] && toolsCount < toolsMaxInRow) {
                toolsCount++;
                toolsAddOnce = true;
                var toolX = (c * (toolInfo.width + toolInfo.paddingLeft)) + toolInfo.offset.left;
                var toolY = (r * toolInfo.height) + toolInfo.offset.top;
                newTool = game.add.sprite(toolX, toolY, 'tools');
                newTool.width = toolInfo.width;
                newTool.height = toolInfo.height;
                game.physics.enable(newTool, Phaser.Physics.ARCADE);
                newTool.body.immovable = true;
                newTool.anchor.set(0.5);
                tools.add(newTool);
            }
            else if(toolsAddOnce) toolsAddOnce = false;
        }
    }
}

// Функция создания жизни
function initHealth() {
    // свойства объекта
    healthInfo = {
        width: 100,
        height: 100,
        count: {
            row: 1,
            col: 4
        },
        offset: {
            top: -(game.world.height*0.75),
            left: 350
        },
        paddingLeft: 50
    };

    // положение в ряду
    var healtCol = Math.floor(Math.random() * healthInfo.count.col);
    // координаты
    var healthX = (healtCol * (healthInfo.width + healthInfo.paddingLeft)) + healthInfo.offset.left;
    var healthY = healthInfo.height + healthInfo.offset.top;
    // создание объекта
    health = game.add.sprite(healthX, healthY, 'health');
    health.width = healthInfo.width;
    health.height = healthInfo.height;
    game.physics.enable(health, Phaser.Physics.ARCADE);
    health.body.immovable = true;
    health.anchor.set(0.5);
}

// Функция при столкновении игрока и ямы
function pitFix(player, pit) {
    // если инструменты есть
    if(toolsCounter) {
        pit_fix.play('fast_fix'); // включаем звук
        pit.kill(); // удаляем яму
        score++; // прибавляем количесвто очков
        scoreText.setText('Очков: ' +score); // выводим очки
        toolsCounter--; // уменьшаем количество инструментов
        toolsText.setText('Инстр.: '+toolsCounter); // выводим
    }
    else { // если инструментов нет
        lives--; // уменьшаем количество жизней
        hit.play('fast_hit'); // включаем звук

        // создаем анимацию удара машины
        var hitTween = game.add.tween(player.scale);
        hitTween.to({x:px*0.85,y:py*0.85}, 100, Phaser.Easing.Linear.None);
        hitTween.to({x:px,y:py}, 750, Phaser.Easing.Linear.None);
        hitTween.start();

        pit.kill(); // удаляем яму
        livesText.setText('Жизни: '+lives); // выводим жизни
        // Если жизней нет и игрок не тестер
        if(!lives && !tester) {
            pit_fix.stop(); // убираем звук починки
            endGame(); // запускаем конец игры
            // анимация исчезновения
            var deadTween = game.add.tween(player.scale);
            deadTween.to({x:0,y:0}, 1250, Phaser.Easing.Linear.None);
            deadTween.start();
        }
    }
}

// Функция подбора инструмента
function toolsAdd(player, tool) {
    toolSound.play('tool'); // включаем звук
    tool.kill(); // удаляем инструмент
    toolsCounter++; // прибавляем количесвто
    toolsText.setText('Инстр.: '+toolsCounter); // выводим
}

// Функция подбора жизни
function healthAdd(player, health) {
    heart.play('heart'); // включаем звук
    health.kill(); // удаляем жизнь
    // Если жизней меньше пяти, то прибавляем и выводим
    if(lives < 5) {
        lives++;
        livesText.setText('Жизни: ' + lives);
    }
}

// Функция конца игры
function endGame() {
    // выключаем звуки
    drive.stop();
    timeSound.stop();
    // включаем звук торможения
    stop.play('stop');
    // убираем статус игры
    playing = false;

    // удаляем все объекты с экрана
    pits.removeAll();
    tools.removeAll();
    health.kill();
    power.kill();

    // скрываем весь текст с экрана
    playerName.visible = false;
    scoreText.visible = false;
    toolsText.visible = false;
    livesText.visible = false;
    timerText.visible = false;
    powerText.visible = false;

    // удаляем кнопку паузы
    pauseButton.destroy();

    // Если количество очков больше, чем имеется в локальном хранилище
    // то записываем значение
    if(score > localStorage.getItem(inpName.value))
        localStorage.setItem(inpName.value, score);


    var playerDetected = false;
    var arr = [];
    // Записываем все значени из хранилища в массив
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        arr.push({name: key, value: localStorage.getItem(key)});
    }

    // сортируем по убыванию очков
    arr.sort((a, b) => b.value - a.value);

    // формируем таблицу в зависимости от места игрока в таблице
    for(let i=0; i<arr.length; i++){
        if (arr[i].name == inpName.value) {
            playerDetected = true;
        }
        if(i < 9 || (i == 9 && playerDetected) || (i >= 9 && arr[i].name == inpName.value)) {
            scoreTable += (i + 1) + '. ' + arr[i].name + ' очков: ' + arr[i].value + '\n';
        }
    }

    // показываем текст конца игры
    endText.visible = true;

    // записываем и показываем таблицу
    gameStat.setText(scoreTable);
    gameStat.visible = true;

    // создаем кнопку рестарат под таблицей
    startButton = game.add.button(game.world.width*0.5, gameStat.height+150, 'button', restartGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);
}

// Функция перезапуска игры путем обновления страницы
function restartGame() {
    location.reload();
}