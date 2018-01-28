#include <stdio.h>
#include <string.h>
/*
    Link: http://ctf.tf/ctfs/zeph1/
    Exp Author: zjuchenyuan
*/
int i,j,k,l,v19,ii,v24,v23,v7,v12,v11,v16;
unsigned int m,v8,v13,name_sum=0;//distinguish unsigned int from signed int is very important!
char output[9999];
char* exp(char* NameString){
  char name_i,name_j,name_k,name_l,name_ii;
  int len_name=strlen(NameString);
  for ( i = 0; i < len_name; name_sum = v7 )
  {
    name_i = *(NameString + i);
    name_sum += name_i;
    if ( name_i < 74 )
      v7 = 2 * name_sum * name_i;
    else
      v7 = name_sum * name_i;
    ++i;
  }
  v8 = name_sum % 0x724;
  //printf("v8=%d\n",v8);
  for ( j = 0; j < len_name; v8 = v12 )
  {
    name_j = *(NameString + j);
    v11 = name_j + v8;
    if ( name_j < 64 )
      v12 = 4 * v11 * name_j;
    else
      v12 = v11 * name_j;
    ++j;
  }
  v13 = v8 % 0x2225;
  //printf("v13=%d\n",v13);
  for ( k = 0; k < len_name; ++k )
  {
    name_k = *(NameString + k);
    v16 = name_k + v13;
    if ( name_k < 84 )
      v13 = 6 * v16 * name_k;
    else
      v13 = v16 * name_k;
  }
  for ( l = 0; l < len_name; ++l )
  {
    name_l = *(NameString + l);
    v19 = name_l + v13;
    if ( name_l < 74 )
      v13 = 5 * v19 * name_l;
    else
      v13 = v19 * name_l;
  }
  ii = 0;
  //printf("m=%d\n",m);
  for ( m = v13 % 0x2E34; ii < len_name; m = v24 )
  {
    name_ii = *(NameString + ii);
    v23 = name_ii + m;
    if ( name_ii < 64 )
      v24 = 7 * v23 * name_ii;
    else
      v24 = v23 * name_ii;
    ++ii;
  }
  //printf("m=%d\n",m);
  sprintf(output, "%X%lu", m, m);
  //puts(output);
  return output;
}
int main(){
	char NameString[9999];
	printf("Input Your Name: ");
	gets(NameString);//example: chenyuan
	printf("Your Serial No: ");
	puts(exp(NameString));//example: 93622A222472684066
}
