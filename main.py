from random import randint
from time import sleep


START = 0
END = 100


def start_game():
    print('Добро пожаловать в игру!')
    sleep(3)
    print(f'Угадай число от {0} до {100}')
    sleep(3)
    computer_num = randint(START, END)
    player_num = None

    while True:
        player_num = int(input('Введите число: '))

        if player_num > computer_num:
            print('Ваше число больше.')
        elif player_num < computer_num:
            print('Ваше число меньше.')
        else:
            print('Все верно! Вы победили!')
            break


if __name__ == '__main__':
    start_game()
