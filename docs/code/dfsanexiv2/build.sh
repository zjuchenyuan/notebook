#!/bin/bash
# create our ABI list file
mkdir -p /data
cd /data
cat /angora/llvm_mode/build/dfsan_rt/share/dfsan_abilist.txt > mylist.txt
cat /angora/llvm_mode/dfsan_rt/abilibstdc++.txt >> mylist.txt

# download and compile libc++, ref: https://github.com/AngoraFuzzer/Angora/blob/master/llvm_mode/libcxx/compile.sh
apt install -y ninja-build

LLVM_VERSION=7.0.0
CUR_DIR=/data
CLANG_SRC=${CUR_DIR}/llvm_src

wget http://releases.llvm.org/${LLVM_VERSION}/llvm-${LLVM_VERSION}.src.tar.xz
wget http://releases.llvm.org/${LLVM_VERSION}/cfe-${LLVM_VERSION}.src.tar.xz
wget http://releases.llvm.org/${LLVM_VERSION}/compiler-rt-${LLVM_VERSION}.src.tar.xz
wget http://releases.llvm.org/${LLVM_VERSION}/libcxx-${LLVM_VERSION}.src.tar.xz
wget http://releases.llvm.org/${LLVM_VERSION}/libcxxabi-${LLVM_VERSION}.src.tar.xz
wget http://releases.llvm.org/${LLVM_VERSION}/libunwind-${LLVM_VERSION}.src.tar.xz
wget http://releases.llvm.org/${LLVM_VERSION}/clang-tools-extra-${LLVM_VERSION}.src.tar.xz

tar -Jxf ${CUR_DIR}/llvm-${LLVM_VERSION}.src.tar.xz 
mv llvm-${LLVM_VERSION}.src $CLANG_SRC
cd ${CLANG_SRC}/tools
tar -Jxf ${CUR_DIR}/cfe-${LLVM_VERSION}.src.tar.xz 
mv cfe-${LLVM_VERSION}.src clang
cd ${CLANG_SRC}/tools/clang/tools
tar -Jxf ${CUR_DIR}/clang-tools-extra-${LLVM_VERSION}.src.tar.xz 
mv clang-tools-extra-${LLVM_VERSION}.src extra
cd ${CLANG_SRC}/projects
tar -Jxvf ${CUR_DIR}/compiler-rt-${LLVM_VERSION}.src.tar.xz
mv compiler-rt-${LLVM_VERSION}.src compiler-rt
tar -Jxvf ${CUR_DIR}/libcxx-${LLVM_VERSION}.src.tar.xz
mv libcxx-${LLVM_VERSION}.src libcxx
tar -Jxvf ${CUR_DIR}/libcxxabi-${LLVM_VERSION}.src.tar.xz
mv libcxxabi-${LLVM_VERSION}.src libcxxabi
tar -Jxvf ${CUR_DIR}/libunwind-${LLVM_VERSION}.src.tar.xz
mv libunwind-${LLVM_VERSION}.src libunwind
cp ./libcxxabi/include/*  ./libcxx/include

mkdir -p /data/build_llvm && cd /data/build_llvm
export CC="clang -ldl -lrt -lpthread -fsanitize=dataflow -fsanitize-blacklist=/data/mylist.txt" CXX="clang++ -ldl -lrt -lpthread -fsanitize=dataflow -fsanitize-blacklist=/data/mylist.txt"
cmake -G Ninja ../llvm_src/  -DLIBCXXABI_ENABLE_SHARED=NO -DLIBCXX_ENABLE_SHARED=NO -DLIBCXX_CXX_ABI=libcxxabi
ninja cxx cxxabi

export CC="clang -L/data/build_llvm/lib -stdlib=libc++ -lc++abi -ldl -lrt -lpthread -fsanitize=dataflow -fsanitize-blacklist=/data/mylist.txt -ggdb" CXX="clang++ -L/data/build_llvm/lib -stdlib=libc++ -lc++abi -ldl -lrt -lpthread -fsanitize=dataflow -fsanitize-blacklist=/data/mylist.txt -ggdb"

# download dependency (expat and zlib) source code
cd /data
sed -i 's/# deb-src/deb-src/g' /etc/apt/sources.list
apt update
apt source zlib1g-dev libexpat1-dev

# compile expat
cd /data/expat-2.1.0
./configure --prefix=/data/expat
make install -j

# compile zlib
cd /data/zlib-1.2.8.dfsg/
./configure --prefix=/data/zlib
make install -j

# download source code
cd /data
wget http://exiv2.org/releases/exiv2-0.26-trunk.tar.gz
tar zxvf exiv2-0.26-trunk.tar.gz
cd /data/exiv2-trunk

CFLAGS='-O0' CXXFLAGS='-O0' ./configure --disable-shared --with-expat=/data/expat --with-zlib=/data/zlib 
make clean; find . -name '*.o' -delete
make -j
# now we get bin/exiv2, about 44MB