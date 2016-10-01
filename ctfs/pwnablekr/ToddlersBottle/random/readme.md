```
random = rand();
```

rand() -> 常に一緒

見れば良い

```
random@ubuntu:~$ gdb ./random
GNU gdb (Ubuntu/Linaro 7.4-2012.04-0ubuntu2.1) 7.4-2012.04
Copyright (C) 2012 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
For bug reporting instructions, please see:
<http://bugs.launchpad.net/gdb-linaro/>...
Reading symbols from /home/random/random...(no debugging symbols found)...done.
(gdb) disas main
Dump of assembler code for function main:
   0x00000000004005f4 <+0>:	push   %rbp
   0x00000000004005f5 <+1>:	mov    %rsp,%rbp
   0x00000000004005f8 <+4>:	sub    $0x10,%rsp
   0x00000000004005fc <+8>:	mov    $0x0,%eax
   0x0000000000400601 <+13>:	callq  0x400500 <rand@plt>
   0x0000000000400606 <+18>:	mov    %eax,-0x4(%rbp)
   0x0000000000400609 <+21>:	movl   $0x0,-0x8(%rbp)
   0x0000000000400610 <+28>:	mov    $0x400760,%eax
   0x0000000000400615 <+33>:	lea    -0x8(%rbp),%rdx
   0x0000000000400619 <+37>:	mov    %rdx,%rsi
   0x000000000040061c <+40>:	mov    %rax,%rdi
   0x000000000040061f <+43>:	mov    $0x0,%eax
   0x0000000000400624 <+48>:	callq  0x4004f0 <__isoc99_scanf@plt>
   0x0000000000400629 <+53>:	mov    -0x8(%rbp),%eax
   0x000000000040062c <+56>:	xor    -0x4(%rbp),%eax
   0x000000000040062f <+59>:	cmp    $0xdeadbeef,%eax
   0x0000000000400634 <+64>:	jne    0x400656 <main+98>
   0x0000000000400636 <+66>:	mov    $0x400763,%edi
   0x000000000040063b <+71>:	callq  0x4004c0 <puts@plt>
   0x0000000000400640 <+76>:	mov    $0x400769,%edi
   0x0000000000400645 <+81>:	mov    $0x0,%eax
   0x000000000040064a <+86>:	callq  0x4004d0 <system@plt>
   0x000000000040064f <+91>:	mov    $0x0,%eax
   0x0000000000400654 <+96>:	jmp    0x400665 <main+113>
   0x0000000000400656 <+98>:	mov    $0x400778,%edi
   0x000000000040065b <+103>:	callq  0x4004c0 <puts@plt>
   0x0000000000400660 <+108>:	mov    $0x0,%eax
   0x0000000000400665 <+113>:	leaveq
   0x0000000000400666 <+114>:	retq
End of assembler dump.
(gdb) b *main+56
Breakpoint 1 at 0x40062c
(gdb) r
Starting program: /home/random/random
1

Breakpoint 1, 0x000000000040062c in main ()
(gdb) x $eax
0x1:	Cannot access memory at address 0x1
(gdb) x $rbp-0x4
0x7fff4ce3128c:	0x6b8b4567
(gdb) x $rbp-0x8
0x7fff4ce31288:	0x00000001
(gdb) x/10x $rbp-0x8
0x7fff4ce31288:	0x00000001	0x6b8b4567	0x00000000	0x00000000
0x7fff4ce31298:	0xb36157ed	0x00007f62	0x00000000	0x00000000
0x7fff4ce312a8:	0x4ce31378	0x00007fff
(gdb) r
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/random/random
2

Breakpoint 1, 0x000000000040062c in main ()
(gdb) x $eax
0x2:	Cannot access memory at address 0x2
(gdb) x/10x $rbp-0x8
0x7fffb56f0598:	0x00000002	0x6b8b4567	0x00000000	0x00000000
0x7fffb56f05a8:	0xf66a57ed	0x00007fce	0x00000000	0x00000000
0x7fffb56f05b8:	0xb56f0688	0x00007fff
(gdb) p 0x6b8b4567^0xdeadbeef
$1 = 3039230856
(gdb) r
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/random/random
warning: no loadable sections found in added symbol-file system-supplied DSO at 0x7fff361fe000
3039230856

Breakpoint 1, 0x000000000040062c in main ()
(gdb) c
Continuing.
Good!
/bin/cat: flag: Permission denied
[Inferior 1 (process 20562) exited normally]
(gdb) quit
random@ubuntu:~$  ./random
3039230856
Good!
Mommy, I thought libc random is unpredictable...
```
