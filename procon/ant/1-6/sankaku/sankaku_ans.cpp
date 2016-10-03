#include <iostream>
#include <algorithm>
const int MAX_A = 100;

int solve(){

  int n,a[MAX_A];

  printf("n = ");
  scanf("%d",&n);
  printf("a = {\n");

  for(int i=0;i<n;i++){
    scanf("%d",&a[i]);
  }
  puts("}");


  int ans = 0;

  for(int i = 0;i<n;i++){
    for(int j=i+1;j<n;j++){
      for(int k=j+1;k<n;k++){
        int len = a[i] + a[j] + a[k];
        int ma = std::max(a[i],std::max(a[j],a[k]));
        int rest = len - ma;
        if(ma < rest){
          ans = std::max(ans,len);
        }
      }
    }
  }
  printf("%d\n",ans);
  return 0;
}

int main(){
  return solve();
}
