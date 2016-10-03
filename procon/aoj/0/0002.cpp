#include<iostream>
#include<algorithm>
using namespace std;

int main(){
    int a[3];
    int b[3];
    for(int i=0;i<3;i++){
      cin >> a[i] >> b[i];
    }
//    int length[3];
    for(int i=0;i<3;i++){
      int l=1;
      int s;
      int length = 1;
      do{
        length++;
        l*=10;
        s = (a[i] + b[i])/l;
      }while(s>9);
      cout << length << endl;
    }
    return 0;
}
