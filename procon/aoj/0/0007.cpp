#include<iostream>
using namespace std;
#include<cmath>
int main(){
    int syakkin = 100000;
    int week;
    cin >> week;
    int risi = 0;
    risi = (syakkin + 20 - 1) /20 ;
    syakkin += risi;
    cout << syakkin << endl;
    syakkin  = syakkin >> 4 << 4 ;
    cout << syakkin  << endl;
    return 0;
}
