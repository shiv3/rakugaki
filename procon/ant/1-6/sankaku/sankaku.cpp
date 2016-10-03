#include <stdio.h>
#include <algorithm>

const int MAX_A = 100;

int solve(){
  int n,arr[MAX_A];

  printf("n = ");
  scanf("%d",&n);
  printf("a = {\n");

  for(int i=0;i<n;i++){
    scanf("%d",&arr[i]);
  }
  puts("}");

  int max = 0;
  int sum;
  for(int a=0;a<n;a++){
    for(int b=0;b<n;b++){
      if(a!=b)
      for(int c=0;c<n;c++){
        if(a!=c&&b!=c){
          if(arr[c] < arr[a] + arr[b]){
            int maxline = std::max(arr[a],std::max(arr[b],arr[c]));
            sum = arr[a] + arr[b] + arr[c];
            int rest = sum - maxline;
            if(rest > max){
              max = rest;
            }
          }
        }
      }
    }
  }

  printf("%d",max);

  return 0;
}
int main(){
  solve();
  return 0;
}
