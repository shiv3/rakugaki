#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/uio.h>
#include <unistd.h>
#include <sys/types.h>



int main(void){
        int fd[2];
        pid_t pid　= fork();

        if(pid == 0) {
          close(fd[1]);
          dup2(fd[0], 0);

          char *env[]={NULL};

          char *execargv[100];
          execargv[0] = "";
          for(int i=0;i<99;i++)
            execargv[i+1] = "A";

          execargv['A'] = "\x00";
          execargv['B'] = "\x20\x0a\x0d";

          execve("/Users/hojo/Desktop/ctf/pwnable/input/a.out", execargv, env);
          
        }else{
          close(fd[0]);
          write(fd[1], "\x00\x0a\x00\xff", 0);
          write(fd[1], "\x00\x0a\x02\xff", 0);
      }
}
