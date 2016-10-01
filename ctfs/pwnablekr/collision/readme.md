4文字ずつ足している

ASCII文字コードを4文字ずつ足して0x21DD09ECになれば良い

```
./a.out AAAAAAAAAAAAAAAAAAAA
```
の場合、
check_password( argv[1] )の結果は```(0x41414141*5)%2147483648 -> 1179010629```となる

2147483648を越えないように

```
(0x21DD09EC-(0x1020304*4)).to_s(16) -> 1dd4fddc
```

```
./col $(python -c 'print "\x04\x03\x02\x01"*4 + "\xdc\xfd\xd4\x1d"')
```
