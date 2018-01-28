#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAX_LEVEL 55
typedef  struct  TreeNode  *Tree;
struct TreeNode {
	Tree Child;
	char key;
	Tree Sibling;
};
int Counter[MAX_LEVEL] ;
/* Counter[i] stores the number of leaves on the i-th level.*/
/* The root is on the level 0. */


void Visit( Tree T, int *level ){
    if(T==NULL){
    	return;
	}else{
    	printf("%c,",T->key);
    	*level+=1;
    	Visit(T->Child,level+1);
	    Visit(T->Sibling,level);
	}
}

int main(){
	struct TreeNode data[20];
	data[0].key='A';data[0].Child=data+1;data[0].Sibling=NULL;
	data[1].key='B';data[1].Child=data+4;data[1].Sibling=data+2;
	data[2].key='C';data[2].Child=data+6;data[2].Sibling=data+3;
	data[3].key='D';data[3].Child=data+7;data[3].Sibling=NULL;
	data[4].key='E';data[4].Child=data+10;data[4].Sibling=data+5;
	data[5].key='F';data[5].Child=NULL;data[5].Sibling=NULL;
	data[6].key='G';data[6].Child=NULL;data[6].Sibling=NULL;
	data[7].key='H';data[7].Child=data+12;data[7].Sibling=data+8;
	data[8].key='I';data[8].Child=NULL;data[8].Sibling=data+9;
	data[9].key='J';data[9].Child=NULL;data[9].Sibling=NULL;
	data[10].key='K';data[10].Child=NULL;data[10].Sibling=data+11;
	data[11].key='L';data[11].Child=NULL;data[11].Sibling=NULL;
	data[12].key='M';data[12].Child=NULL;data[12].Sibling=NULL;
	Visit(data,Counter);
	printf("\n");
	int i;
	for(i=0;i<4;i++){
		printf("%d:%d\n",i,Counter[i]);
	}
}