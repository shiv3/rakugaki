#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
char buf[32];
int main(int argc, char* argv[], char* envp[]){
	if(argc<2){
		printf("pass argv[1] a number\n");
		return 0;
	}
	printf("%s\n",argv[1]);
  int fd = atoi( argv[1] ) - 0x1234;
  printf("%d\n",fd);
	int len = 0;
	len = read(fd, buf, 32);
	if(!strcmp("LETMEWIN\n", buf)){
		printf("good job :)\n");
		system("/bin/cat flag");
		exit(0);
	}
	printf("learn about Linux file IO\n");
	return 0;

}
