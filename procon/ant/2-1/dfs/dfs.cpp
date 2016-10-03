#include <stdio.h>

const int MAX_N = 20;
int a[] = {1,2,4,7,9};

int k = 22;
int n = 5;



bool dfs(int i,int sum){
  if(i==n) return sum == k;
  if(dfs(i+1,sum))return true;
  if(dfs(i+1,sum + a[i])) return true;
  return false;
}

int solve(){
  if(dfs(0,0))printf("Yes\n");
  else printf("NO\n");
  return 0;
}

int main(){
  return solve();
}
