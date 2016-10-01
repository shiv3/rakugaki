# from pwn import *
#
# context(arch = 'i386', os = 'linux')
# conn = process("./a.out")

import subprocess

args  = ["./a.out"]
args.extend(("A /"*(65-1)).split("/"))
args.extend(["\x00 "])
args.extend(["\x01\x00\x02\x01 "]) #-> 怒られる
p = subprocess.Popen(args)
p.stdout.close()
