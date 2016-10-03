#include <stdio.h>

int fib(int n){
  if(n <= 1) return n;
  return fib(n-1) + fib(n-2);
}
int main(){
   printf("%d",fib(1000));
   return 0;
}
