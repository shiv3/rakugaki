```
Papa brought me a packed present! let's open it.

Download : http://pwnable.kr/bin/flag

This is reversing task. all you need is binary
```


```packed present``` -> packer ?

```
$ strings flag |head
UPX!
@/x8
    E&8
gX lw_
H/\_@
H9\$(t
[]]y
nIV,Uh
AWAVAUATS
uSL9
[A\AA;h
```

-> [UPX!](https://upx.github.io/)


```
$ brew install upx
$ upx -d flag
```

```
(gdb) b *main+39
Breakpoint 2 at 0x40118b
(gdb) r
(gdb) disas main
Dump of assembler code for function main:
   0x0000000000401164 <+0>:	push   %rbp
   0x0000000000401165 <+1>:	mov    %rsp,%rbp
   0x0000000000401168 <+4>:	sub    $0x10,%rsp
   0x000000000040116c <+8>:	mov    $0x496658,%edi
   0x0000000000401171 <+13>:	callq  0x402080 <puts>
   0x0000000000401176 <+18>:	mov    $0x64,%edi
   0x000000000040117b <+23>:	callq  0x4099d0 <malloc>
   0x0000000000401180 <+28>:	mov    %rax,-0x8(%rbp)
   0x0000000000401184 <+32>:	mov    0x2c0ee5(%rip),%rdx        # 0x6c2070 <flag>
=> 0x000000000040118b <+39>:	mov    -0x8(%rbp),%rax
   0x000000000040118f <+43>:	mov    %rdx,%rsi
   0x0000000000401192 <+46>:	mov    %rax,%rdi
   0x0000000000401195 <+49>:	callq  0x400320
   0x000000000040119a <+54>:	mov    $0x0,%eax
   0x000000000040119f <+59>:	leaveq
   0x00000000004011a0 <+60>:	retq   
End of assembler dump.
(gdb) x $rdx
0x496628:	"UPX...? sounds like a delivery service :)"

```
