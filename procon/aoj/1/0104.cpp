#include <iostream>
#include <vector>
using namespace std;

int main(){
    while(1){
      int H,W;
      cin >> W >> H;
      if(W==0||H==0)return 0;
      vector<vector<char> > matrix(H,vector<char>(W));
      for(int i=0;i<H;++i){
        for(int j=0;j<W;++j){
          cin >> matrix[i][j];
        }
      }
      
      int X,Y = 0;
      int st = 1;
      int cnt = 0;
      while(st==1){
        // cout << " " << "(" << X  << ","<< Y <<") " << matrix[Y][X]  << endl;
        switch (matrix[Y][X]) {
          case '>':
            X++;break;
          case '<':
            X--;break;
          case '^':
            Y--;break;
          case 'v':
            Y++;break;
          case '.':
            st = false;
        }
        if(X>W||Y>H||X<0||Y<0){
          st = 0;
        }
        if(cnt > H*W){
          st = 3;
        }
        cnt ++ ;
      }
      if(st==0){
        cout << X << " " << Y << endl;
      }else{
        cout << "LOOP" << endl;
      }
    }
    return 0;
}
