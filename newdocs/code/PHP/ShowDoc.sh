# how to install ShowDoc in centos

yum install nginx php php-gd php-fpm php-mcrypt php-mbstring php-mysql php-pdo


curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

composer config -g repo.packagist composer https://packagist.phpcomposer.com

cd /var/www/html/ && composer create-project  showdoc/showdoc

chmod a+w showdoc/install
chmod a+w showdoc/Sqlite
chmod a+w showdoc/Sqlite/showdoc.db.php
chmod a+w showdoc/Public/Uploads/
chmod a+w showdoc/Application/Runtime
chmod a+w showdoc/server/Application/Runtime
chmod a+w showdoc/Application/Common/Conf/config.php
chmod a+w showdoc/Application/Home/Conf/config.php