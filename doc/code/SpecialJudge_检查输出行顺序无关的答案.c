/*
 * 本代码是评判输出行无关的Special Judge代码，用于OnlineJudge
 * 原理为把标准答案写入代码中，先把标准答案和用户答案都qsort排序后再逐行比较
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define AC 0
#define WA 1
#define ERROR -1

#define LINES 100 //答案一共有100行
#define LINELEN 15 //建议这个数值略大于每行最长长度
char truelines[][LINELEN]={/*这里是标准答案，顺序无关，一共LINES行，每行最长LINELEN-1个字符*/}

int compare(const void* a,const void* b){
	return strcmp((const char*)a,(const char*)b);
}

int spj(FILE *input, FILE *user_output);

void close_file(FILE *f){
    if(f != NULL){
        fclose(f);
    }
}

int main(int argc, char *args[]){
    FILE *input = NULL, *user_output = NULL;
    int result;
    if(argc != 3){
        printf("Usage: spj x.in x.out\n");
        return ERROR;
    }
    input = fopen(args[1], "r");
    user_output = fopen(args[2], "r");
    if(input == NULL || user_output == NULL){
        printf("Failed to open output file\n");
        close_file(input);
        close_file(user_output);
        return ERROR;
    }
    result = spj(input, user_output);
    printf("result: %d\n", result);
    close_file(input);
    close_file(user_output);
    return result;
}
int spj(FILE *input, FILE *user_output){
    /*如果用户答案错误，返回WA；否则返回AC*/
	int i;char *tmp,userlines[LINES][LINELEN];
	for(i=0;i<LINES;i++){
		tmp=fgets(userlines[i],LINELEN,user_output);
		userlines[i][strlen(userlines[i])-1]=0;//fgets会得到\n，需要删掉
	}
	qsort(truelines,LINES,LINELEN,compare);
	qsort(userlines,LINES,LINELEN,compare);
	for(i=0;i<LINES;i++){
		//printf("%s,%s\n",truelines[i],userlines[i]);
		if(strcmp(truelines[i],userlines[i])!=0) return WA;
	}
	return AC;
}

