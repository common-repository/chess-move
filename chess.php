<?php
/**
 * @package Chess
 * @version 1.0
 */
/*
Plugin Name: Chess Move
Plugin URI: https://wordpress.org/plugins/chess-move/
Description: Chess
Author: Jaco Thiart
Version: 1.0
Author URI: http://jacothiart.com
*/
function chess_move_enqueue_scripts() {
    $path = sprintf('%s%s', plugins_url(), '/chess-move/');
    wp_enqueue_style('chess-move-css', $path . 'css/chess.css', false, '1.0.0');
    wp_enqueue_script("jquery");
    wp_enqueue_script('chess-move-js', $path . 'js/chess.js', false, '1.0.0');
}

add_action('admin_enqueue_scripts', 'chess_move_enqueue_scripts');

define('CHESS_MOVE_ROW_COUNT', 8);
define('CHESS_MOVE_BLOCK_COUNT', CHESS_MOVE_ROW_COUNT * CHESS_MOVE_ROW_COUNT);
define('CHESS_MOVE_HEIGHT', 50);
define('CHESS_MOVE_WIDTH', CHESS_MOVE_HEIGHT);

function chess_move() {
    $j = 0;
    $k = 0;
    $css = '';
    $html = '';

    $i = 0;

    while($i < CHESS_MOVE_BLOCK_COUNT) {
        $top = $j * CHESS_MOVE_HEIGHT;
        $left = $k * CHESS_MOVE_WIDTH;

        if(($i + 1) % CHESS_MOVE_ROW_COUNT == 0 and $i != 0) {
            $j ++;
            $k = 0;
        } else {
            $k = $k + 1;
        }

        $i ++;
    }

    $uneven = array(0, 2, 4, 6, 9, 11, 13, 15, 16, 18, 20, 22, 25, 27, 29, 31, 32, 34, 36, 38, 41, 43, 45, 47, 48, 50, 52, 54, 57, 59, 61, 63);

    $i = 0;

    while($i < CHESS_MOVE_BLOCK_COUNT) {
        $html .= sprintf('<div class="block_%d block', $i);
        if(in_array($i, $uneven)) {
            $html .= ' uneven';
        }
        $html .= '">';

        if($i < 16 || $i > 47) {
            if($i == 0 || $i == 7) {
                $img = '&#9820;';
            }
            if($i == 1 || $i == 6) {
                $img = ' &#9822;';
            }
            if($i == 2 || $i == 5) {
                $img = '&#9821;';
            }
            if($i == 3) {
                $img = '&#9819;';
            }
            if($i == 4) {
                $img = ' &#9818;';
            }
            if($i > 7 && $i < 16) {
                $img = '&#9823;';
            }
            if($i == 56 || $i == 63) {
                $img = ' &#9814;';
            }
            if($i == 57 || $i == 62) {
                $img = ' &#9816;';
            }
            if($i == 58 || $i == 61) {
                $img = '&#9815;';
            }
            if($i == 59) {
                $img = '&#9813;';
            }
            if($i == 60) {
                $img = ' &#9812;';
            }
            if($i > 47 && $i < 56) {
                $img = '&#9817;';
            }
        } else {
            $img = '&nbsp;';
        }
        $html .= $img;

        $html .= '</div>';

        $i ++;
    }

    echo sprintf('<div class="chess-move">
        <div class="timer">
            <span class="time">0</span>s
        </div>
        <div id="playarea" class="area">
        %s
        </div>
    </div>', $html);
}

function chess_move_menu_page() {
    add_menu_page(
        'Chess Move',
        'Chess Move',
        'manage_options',
        'chess-move',
        'chess_move'
    );
}
add_action('admin_menu', 'chess_move_menu_page');

function chess_move_init() {
    return chess_move();
}
add_shortcode('chess_move', 'chess_move_init');